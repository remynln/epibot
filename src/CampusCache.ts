import axios from 'axios'
import groupBy from 'lodash.groupby'
import { campusOptions } from './utils'

declare type Data = {
  city: string
  // course: string
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

    const promises = campus
      ?.filter((campus) => !this.cache.find(({ city }) => city === campus))
      .map((city) =>
        axios
          .get(
            `https://roslyn.epi.codes/trombi/api.php?action=search&q=&filter[city]=${city}`
          )
          .then(({ data: { count } }) => ({ city, total: count }))
      )

    if (promises?.length) {
      await Promise.allSettled(promises).then((results) => {
        for (const res of results) {
          if (res.status === 'fulfilled') this.cache.push(res.value)
          else this.error = res.reason.response
        }
      })
    }

    return this.cache.filter(({ city }) => campus?.includes(city))
  }
}

export default Campus
