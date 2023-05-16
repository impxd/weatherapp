import { Component, ViewEncapsulation, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'
import {
  Subject,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  repeat,
  share,
  startWith,
  switchMap,
  takeUntil,
  tap,
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
      >
        <option
          value=""
          disabled
          [attr.selected]="vm.latLng == null ? '' : null"
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
        (click)="
          dispatch({
            type: 'setCapital',
            value: null
          })
        "
      >
        Clear
      </button>

      <hr />
      <div
        class="progress-bar"
        [style.display]="
          vm.capitals == null || vm.periodsLoading ? 'block' : 'none'
        "
      >
        <div></div>
      </div>

      <section *ngIf="vm.periods != null" id="weather">
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

        hr {
          margin-top: 1rem;
        }

        #weather {
          margin-top: 1rem;

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
      map((queryParams) => queryParams.get('latLng')),
      distinctUntilChanged()
    )

    const periods$ = latLng$.pipe(
      switchMap((latLng) =>
        latLng == null
          ? of(null)
          : this.weather
              .fetchForecast(latLng)
              .pipe(map((forecast) => forecast.properties.periods))
      ),
      share()
    )

    const periodsLoading$ = merge(
      of(false),
      latLng$.pipe(
        filter(Boolean),
        map(() => true)
      ),
      periods$.pipe(
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
