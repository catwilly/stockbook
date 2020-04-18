import { PortfolioStock } from './stock';

export const testportfolio: PortfolioStock[] = [    
    {
       "stock":{
          "symbol":"TEF.MDR",
          "name":"Telefonica, S.A.",
          "region":"Madrid",
          "currency":"EUR"
       },
       "entries":[
          {
             "timeStamp": new Date("2018-05-31T22:00:00.000Z"),
             "entryType":0,
             "numShares":25,
             "sharePrice":7.655,
             "comission":2.08,
             "taxes":0,
             "total": null
          },
          {
             "timeStamp":new Date("2018-06-14T22:00:00.000Z"),
             "entryType":0,
             "numShares":2,
             "sharePrice":7.497,
             "comission":2.08,
             "taxes":0,
             "total": null
          },
          {
             "timeStamp":new Date("2018-06-14T22:00:00.000Z"),
             "entryType":2,
             "numShares":null,
             "sharePrice":null,
             "comission":0,
             "taxes":0.95,
             "total": 5
          },
          {
             "timeStamp":new Date("2018-12-19T23:00:00.000Z"),
             "entryType":2,
             "numShares":null,
             "sharePrice":null,
             "comission":0,
             "taxes":1.01,
             "total":5.4
          },
          {
             "timeStamp":new Date("2019-06-19T22:00:00.000Z"),
             "entryType":2,
             "numShares":null,
             "sharePrice":null,
             "comission":0,
             "taxes":1.01,
             "total": 5.4
          },
          {
             "timeStamp":new Date("2019-07-30T22:00:00.000Z"),
             "entryType":0,
             "numShares":173,
             "sharePrice":6.91,
             "comission":2.69,
             "taxes":0,
             "total": null
          },
          {
             "timeStamp":new Date("2019-08-28T22:00:00.000Z"),
             "entryType":0,
             "numShares":160,
             "sharePrice":6.253,
             "comission":2.58,
             "taxes":0,
             "total": null
          },
          {
             "timeStamp":new Date("2019-12-18T23:00:00.000Z"),
             "entryType":2,
             "numShares":null,
             "sharePrice":null,
             "comission":0,
             "taxes":13.59,
             "total": 72
          },
          {
             "timeStamp":new Date("2019-12-30T23:00:00.000Z"),
             "entryType":0,
             "numShares":100,
             "sharePrice":6.229,
             "comission":2.36,
             "taxes":0,
             "total":null
          },
          {
             "timeStamp":new Date("2020-02-26T23:00:00.000Z"),
             "entryType":0,
             "numShares":100,
             "sharePrice":5.73,
             "comission":2.29,
             "taxes":0,
             "total": null
          },
          {
             "timeStamp":new Date("2020-03-31T22:00:00.000Z"),
             "entryType":0,
             "numShares":500,
             "sharePrice":4.02,
             "comission":3.01,
             "taxes":0,
             "total": null
          }
       ],
       "dayHistory":[
 
       ],
       "dateRange":"month6"
    }
 ]