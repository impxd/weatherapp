import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { forkJoin, map, switchMap } from 'rxjs'
import { fromLatLng } from 'src/app/shared/utils'

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  readonly http = inject(HttpClient)

  static readonly API_WEATHER = 'https://api.weather.gov/'
  static readonly API_OPENWEATHER = 'http://api.openweathermap.org/'
  static readonly API_OPENWEATHER_KEY = '405e5458d110b924725271f5c7547f22'
  static readonly AQI: Record<number, string> = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor',
  }

  fetchPoints(latLng: LatLng) {
    return this.http.get<FetchPoints>(
      WeatherService.API_WEATHER + `points/${latLng}`
    )
  }

  fetchAirPollution(latLng: LatLng) {
    const [lat, lng] = fromLatLng(latLng)

    return this.http.get<FetchAirPollution>(
      WeatherService.API_OPENWEATHER +
        `data/2.5/air_pollution/forecast?lat=${lat}&lon=${lng}&appid=${WeatherService.API_OPENWEATHER_KEY}`
    )
  }

  fetchForecast(latLng: LatLng) {
    return forkJoin([
      this.fetchAirPollution(latLng),
      this.fetchPoints(latLng),
    ]).pipe(
      switchMap(([airPollution, pointsData]) =>
        this.http.get<FetchForecast>(pointsData.properties.forecast).pipe(
          map((forecast) => ({
            ...forecast,
            properties: {
              ...forecast.properties,
              periods: forecast.properties.periods
                .reduce((acc, curr, index, array) => {
                  if (curr.isDaytime === true) return acc.concat(curr)
                  else if (acc.length === 0 || index === array.length - 1) {
                    return acc.concat({
                      ...curr,
                      temperatureMin: curr.temperature,
                      temperature: undefined,
                    })
                  }

                  acc[acc.length - 1].temperatureMin = curr.temperature

                  return acc
                }, [] as Period[])
                .slice(0, 7)
                .map((period) => {
                  const aqi = airPollution.list.find((item) =>
                    period.startTime.startsWith(
                      new Date(item.dt * 1000).toISOString().slice(0, 13)
                    )
                  )

                  return {
                    ...period,
                    shortName: shortName(period.name),
                    aqi: aqi?.main.aqi,
                    aqiTxt: aqi?.main.aqi
                      ? WeatherService.AQI[aqi?.main.aqi]
                      : undefined,
                  }
                }),
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
  updated: string
  units: string
  forecastGenerator: string
  generatedAt: string
  updateTime: string
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
  startTime: string
  endTime: string
  isDaytime: boolean
  temperature?: number
  temperatureMin?: number
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
  // Aggregations
  aqi?: number
  aqiTxt?: string
}

// Types for fetchAirPollution
// auto-generated code from https://app.quicktype.io/

export interface FetchAirPollution {
  coord: Coord
  list: List[]
}

export interface Coord {
  lon: number
  lat: number
}

export interface List {
  main: Main
  components: { [key: string]: number }
  dt: number
}

export interface Main {
  aqi: number
}
