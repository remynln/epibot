import axios from 'axios'
import groupBy from 'lodash.groupby'
import { DateTime } from 'luxon'
import { campusOptions } from './utils'

declare type Data = {
  city: string
  promo: number
  total: number
}

class Campus {
  private static cache: Data[] = []
  private static _error: Response | undefined = undefined

  static get error() {
    return this._error
  }
  private static set error(value) {
    this._error = value
  }

  static getRaw(campus?: string[]) {
    return this.getData(campus)
  }

  static getGroup(campus?: string[]) {
    return this.getData(campus).then((data) => this.toGroup(data))
  }

  private static toGroup(data: Data[]) {
    return Object.values(
      groupBy(data, 'city') as {
        [key: string]: Data[]
      }
    )
      .map((group) =>
        group.reduce((p, n) => ({ ...p, total: p.total + n.total }))
      )
      .filter(({ city }) => city)
  }

  private static async getData(campus?: string[]) {
    if (!campus)
      campus = campusOptions.choices?.map(({ value }) => value as string)

    const promises = []
    for (let i = 1; i <= 5; i++) {
      const promo = DateTime.now().plus({ year: 5 - i }).year
      promises.push(
        campus
          ?.filter((campus) => !this.cache.find(({ city }) => city === campus))
          .map((city) => [
            axios
              .get(
                `https://roslyn.epi.codes/trombi/api.php?action=search&q=&filter[city]=${city}&filter[promo]=${promo}`
              )
              .then(({ data: { count } }) => {
                return { city, promo, total: count }
              }),
            axios
              .get(
                `https://roslyn.epi.codes/trombi/api.php?action=search&q=&filter[course]=master%2Fclassic&filter[city]=${city}&filter[promo]=${promo}`
              )
              .then(({ data: { count } }) => {
                return { city, promo, total: -count }
              }),
            axios
              .get(
                `https://roslyn.epi.codes/trombi/api.php?action=search&q=&filter[course]=master%2Fclassic&filter[city]=${city}&filter[promo]=${promo}`
              )
              .then(({ data: { count } }) => {
                return { city, promo, total: -count }
              })
          ])
          .flat()
      )
    }

    if (promises?.length) {
      await Promise.allSettled(promises.flat()).then((results) => {
        for (const res of results) {
          if (res.status === 'fulfilled') {
            if (res.value) this.cache.push(res.value)
          } else this.error = res.reason.response
        }
      })
    }

    return this.cache.filter(({ city }) => campus?.includes(city))
  }
}

export default Campus
