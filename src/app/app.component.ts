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
  takeUntil,
  tap,
} from 'rxjs'
import { toLatLng, viewModel } from 'src/app/shared/utils'

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
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
    </ng-container>
  `,
  styles: [
    `
      app-root > {
        label {
          display: block;
        }

        select {
          display: inline-block;
        }
      }
    `,
  ],
})
export class AppComponent {
  readonly http = inject(HttpClient)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)

  readonly actions = new Subject<Action>()
  readonly vm$

  constructor() {
    const capitals$ = this.fetchStateCapitals().pipe(startWith(null), share())

    const latLng$ = this.route.queryParamMap.pipe(
      map((queryParams) => queryParams.get('latLng')),
      distinctUntilChanged()
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

type LatLng = string

export type SetCapitalAction = {
  type: 'setCapital'
  value: LatLng | null
}

export type Action = SetCapitalAction

// Types

export interface StateCapital {
  lon: number
  lat: number
  state: string
  city: string
}

export type FetchStateCapitals = StateCapital[]
