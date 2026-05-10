import request from '@/config/axios'

export interface ForecastDayVO {
  forecastDate: string
  weatherDesc?: string
  tempMin?: number
  tempMax?: number
  humidity?: number
  rainfall?: number
}

export interface WeatherDataVO {
  farmId?: number
  farmName?: string
  recordTime?: string
  weatherDesc?: string
  temperature?: number
  humidity?: number
  rainfall?: number
  pressure?: number
  source?: string
  forecast?: ForecastDayVO[]
}

export const WeatherDataApi = {
  /** 获取所有农场最新天气数据 */
  getLatestWeatherList: async (): Promise<WeatherDataVO[]> => {
    return await request.get({ url: '/agri/weather/latest' })
  },

  /** 刷新所有农场天气数据 */
  refreshWeather: async (): Promise<boolean> => {
    return await request.post({ url: '/agri/weather/refresh' })
  },

  /** 获取指定农场最新天气数据 */
  getLatestWeatherByFarmId: async (farmId: number): Promise<WeatherDataVO> => {
    return await request.get({ url: `/agri/weather/latest/${farmId}` })
  }
}
