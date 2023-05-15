import { combineLatest, type ObservableInput } from 'rxjs'

export const viewModel = <T extends Record<string, ObservableInput<any>>>(
  sourcesObject: T
) => {
  // Remove $ suffixes at runtime level
  for (const key in sourcesObject) {
    if (key.endsWith('$')) {
      ;(sourcesObject as any)[key.slice(0, -1) as any] = sourcesObject[key]
      delete sourcesObject[key]
    }
  }

  return combineLatest(
    // Remove $ suffixes at type level
    sourcesObject as {
      [P in keyof T as P extends `${infer U}$` ? U : P]: T[P]
    }
  )
}

export const toLatLng = (coordsLike: { lon: number; lat: number }) => {
  return [coordsLike.lon, coordsLike.lat].join(',')
}
