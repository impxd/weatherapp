import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, switchMap } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  readonly http = inject(HttpClient)
  static readonly API_WEATHER = 'https://api.weather.gov/'

  fetchPoints(latLng: LatLng) {
    return this.http.get<FetchPoints>(
      WeatherService.API_WEATHER + `points/${latLng}`
    )
  }

  fetchForecast(latLng: LatLng) {
    return this.fetchPoints(latLng).pipe(
      switchMap((pointsData) =>
        this.http.get<FetchForecast>(pointsData.properties.forecast).pipe(
          map((forecast) => ({
            ...forecast,
            properties: {
              ...forecast.properties,
              periods: forecast.properties.periods
                .filter((period) => period.isDaytime)
                .map((period) => ({
                  ...period,
                  shortName: shortName(period.name),
                })),
            },
          }))
        )
      )
    )
  }
}

// Type transformations

export function shortName(name: string) {
  return name
    .replace('Monday', 'Mon')
    .replace('Tuesday', 'Tue')
    .replace('Wednesday', 'Wed')
    .replace('Thursday', 'Thu')
    .replace('Friday', 'Fri')
    .replace('Saturday', 'Sat')
    .replace('Sunday', 'Sun')
    .replace('This', '')
}

// Types

export type LatLng = string

// Types for fetchPoints
// auto-generated code from https://app.quicktype.io/

export interface FetchPoints {
  '@context': Array<ContextClass | string>
  id: string
  type: string
  geometry: Geometry1
  properties: FetchPointsProperties
}

export interface ContextClass {
  '@version': string
  wx: string
  s: string
  geo: string
  unit: string
  '@vocab': string
  geometry: Distance
  city: string
  state: string
  distance: Distance
  bearing: CountyClass
  value: Value
  unitCode: Distance
  forecastOffice: CountyClass
  forecastGridData: CountyClass
  publicZone: CountyClass
  county: CountyClass
}

export interface CountyClass {
  '@type': string
}

export interface Distance {
  '@id': string
  '@type': string
}

export interface Value {
  '@id': string
}

export interface Geometry1 {
  type: string
  coordinates: number[]
}

export interface FetchPointsProperties {
  '@id': string
  '@type': string
  cwa: string
  forecastOffice: string
  gridId: string
  gridX: number
  gridY: number
  forecast: string
  forecastHourly: string
  forecastGridData: string
  observationStations: string
  relativeLocation: RelativeLocation
  forecastZone: string
  county: string
  fireWeatherZone: string
  timeZone: string
  radarStation: string
}

export interface RelativeLocation {
  type: string
  geometry: Geometry1
  properties: RelativeLocationProperties
}

export interface RelativeLocationProperties {
  city: string
  state: string
  distance: DistanceClass
  bearing: DistanceClass
}

export interface DistanceClass {
  unitCode: string
  value: number
}

// Types for fetchForecast
// auto-generated code from https://app.quicktype.io/

export interface FetchForecast {
  '@context': Array<ContextClass | string>
  type: string
  geometry: Geometry
  properties: Properties
}

export interface Geometry {
  type: string
  coordinates: Array<Array<number[]>>
}

export interface Properties {
  updated: Date
  units: string
  forecastGenerator: string
  generatedAt: Date
  updateTime: Date
  validTimes: string
  elevation: Elevation
  periods: Period[]
}

export interface Elevation {
  unitCode: string
  value: number
}

export interface Period {
  number: number
  name: string
  shortName: string
  startTime: Date
  endTime: Date
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  temperatureTrend: null | string
  probabilityOfPrecipitation: Elevation
  dewpoint: Elevation
  relativeHumidity: Elevation
  windSpeed: string
  windDirection: string
  icon: string
  shortForecast: string
  detailedForecast: string
}
