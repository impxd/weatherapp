import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'
import {
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  partition,
  share,
  startWith,
  switchMap,
  tap,
  timer,
} from 'rxjs'
import { toLatLng, viewModel } from 'src/app/shared/utils'
import {
  WeatherService,
  type LatLng,
} from 'src/app/shared/services/weather.service'
import { PeriodCardComponent } from 'src/app/shared/components/period-card.component'
import { PeriodDetailsComponent } from './shared/components/period-details.component'

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PeriodCardComponent, PeriodDetailsComponent],
  template: `
    <main *ngIf="vm$ | async as vm">
      <label>State Capital</label>
      <select
        [disabled]="vm.capitals == null"
        (change)="
          dispatch({
            type: 'setCapital',
            value: asAny($event.target).value
          })
        "
        data-testid="capitals-select"
      >
        <option
          value=""
          disabled
          [attr.selected]="vm.latLng == null ? '' : null"
          data-testid="capitals-select-placeholder"
        >
          {{ vm.capitals == null ? 'Loading...' : 'Select your option' }}
        </option>
        <option
          *ngFor="let capital of vm.capitals"
          [value]="capital.latLng"
          [attr.selected]="capital.latLng === vm.latLng ? '' : null"
        >
          {{ capital.state }} - {{ capital.city }}
        </option>
      </select>
      <button
        type="button"
        [style.visibility]="vm.latLng != null ? 'visible' : 'hidden'"
        (click)="
          dispatch({
            type: 'setCapital',
            value: null
          })
        "
        data-testid="capitals-clear-btn"
      >
        Clear
      </button>

      <span
        [style.visibility]="vm.error ? 'visible' : 'hidden'"
        class="errormessage"
      >
        {{ vm.error ?? '-' }}
      </span>

      <hr />
      <div
        class="progress-bar"
        [style.display]="
          vm.capitals == null || vm.periodsLoading ? 'block' : 'none'
        "
      >
        <div></div>
      </div>

      <section
        *ngIf="vm.periods != null"
        id="forecast"
        [class.error]="vm.error != null"
        data-testid="forecast"
      >
        <app-period-details [period]="vm.period" />

        <ul class="periods">
          <li
            *ngFor="let period of vm.periods; let index = index"
            [class.selected]="period.number === vm.period?.number"
          >
            <button
              (click)="dispatch({
              type: 'selectPeriod',
              index,
            })"
            >
              <app-period-card [period]="period" />
            </button>
          </li>
        </ul>
      </section>
    </main>
  `,
  styles: [
    `
      app-root > main > {
        label {
          display: block;
        }

        select {
          display: inline-block;
        }

        .progress-bar {
          margin-top: -9px;
        }

        .errormessage {
          float: right;
          display: inline-block;
          margin-top: 24px;
          margin-bottom: 0;
          visibility: hidden;
          white-space: nowrap;
          font-size: 13px;
          color: var(--error);
        }

        hr {
          margin-top: 1rem;
        }

        #forecast {
          margin-top: 1rem;

          &.error {
            filter: blur(1px);
            opacity: 0.9;
          }

          .periods {
            padding: 0;
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            grid-gap: 1rem;
            justify-content: center;

            li.selected button {
              padding: 8px 0;
              background-color: #efefef;
            }

            button {
              margin: 0;
              background: transparent;
              padding: 0;
              width: 100%;
              border: none;
              height: 100%;
            }
          }
        }
      }
    `,
  ],
})
export class AppComponent {
  readonly http = inject(HttpClient)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly weather = inject(WeatherService)

  readonly actions = new Subject<Action>()
  readonly vm$

  constructor() {
    const capitals$ = this.fetchStateCapitals().pipe(startWith(null), share())

    const latLng$ = this.route.queryParamMap.pipe(
      switchMap((queryParams) =>
        queryParams.get('latLng')
          ? timer(300).pipe(map(() => queryParams.get('latLng')))
          : of(null)
      ),
      distinctUntilChanged()
    )

    const periodsRequest$ = latLng$.pipe(
      switchMap((latLng) =>
        latLng == null
          ? of(null)
          : this.weather.fetchForecast(latLng).pipe(
              map((forecast) => forecast.properties.periods),
              catchError((error: HttpErrorResponse) => of(error))
            )
      ),
      share()
    )

    const [periodsError$, periods$] = partition(
      periodsRequest$,
      (value): value is HttpErrorResponse => value instanceof HttpErrorResponse
    )

    const periodsLoading$ = merge(
      of(false),
      latLng$.pipe(
        filter(Boolean),
        map(() => true)
      ),
      periodsRequest$.pipe(
        filter(Boolean),
        map(() => false)
      )
    )

    const period$ = periods$.pipe(
      switchMap((periods) => {
        return periods && periods.length > 0
          ? this.actions.pipe(
              filter((a): a is SelectPeriodAction => a.type === 'selectPeriod'),
              map((a) => periods[a.index]),
              startWith(periods[0])
            )
          : of(null)
      }),
      startWith(null)
    )

    const error$ = merge(
      of(null),
      latLng$.pipe(map(() => null)),
      periodsError$.pipe(map(() => 'Network request failed!'))
    )

    const effects$ = merge(
      this.actions.pipe(
        filter((a): a is SetCapitalAction => a.type === 'setCapital'),
        tap((a) =>
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { latLng: a.value },
          })
        )
      )
    ).pipe(startWith(null))

    this.vm$ = viewModel({
      capitals$,
      latLng$,
      periods$,
      periodsLoading$,
      period$,
      error$,
      effects$,
    })
  }

  // Methods

  dispatch(a: Action) {
    this.actions.next(a)
  }

  // API calls

  fetchStateCapitals() {
    return this.http
      .get<FetchStateCapitals>(
        'https://raw.githubusercontent.com/vega/vega/main/docs/data/us-state-capitals.json'
      )
      .pipe(
        map((capitals) =>
          capitals.map((capital) => ({
            ...capital,
            latLng: toLatLng(capital),
          }))
        )
      )
  }

  // Utils

  asAny<T>(val: T) {
    return val as any
  }
}

// UI Interaction

export type SetCapitalAction = {
  type: 'setCapital'
  value: LatLng | null
}

export type SelectPeriodAction = {
  type: 'selectPeriod'
  index: number
}

export type Action = SetCapitalAction | SelectPeriodAction

// Types

export interface StateCapital {
  lon: number
  lat: number
  state: string
  city: string
}

export type FetchStateCapitals = StateCapital[]
