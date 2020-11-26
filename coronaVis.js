import define1 from "./table.js"; // extra library
import define2 from "./vegalite.js"; // extra API
import define3 from "./select.js"; // library

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Corona Quick Visualizations`
)});
  main.variable(observer()).define(["md"], function(md){return(
md``
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Choose how to plot the numbers`
)});
  main.variable(observer("viewof PM")).define("viewof PM", ["select"], function(select){return(
select({
  title: "Plot per million",
  description: "Please choose if you want to plot per million inhabitants.",
  options: ["Yes", "No"],
  value: "Yes"
})
)});
  main.variable(observer("PM")).define("PM", ["Generators", "viewof PM"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md``
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 1. Visualisation of confirmed cases, deaths and recovered people `
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Here we plot the basic numbers avaliable: confirmed cases, deaths and recovered patients. Please keep in mind that the numbers reported on one day do not necessarily reflect the occurrences on that day. Administration in hospitals and other official sources sometimes lags behind. See the data source of the Johns Hopkins university (https://github.com/CSSEGISandData/COVID-19) for more details on the data.`
)});
  main.variable(observer("viewof country")).define("viewof country", ["select","countryOptionsSelection"], function(select,countryOptionsSelection){return(
select({
  title: "Country",
  description: "Please pick a country.",
  options: countryOptionsSelection,
  value: "United Kingdom"
})
)});
  main.variable(observer("country")).define("country", ["Generators", "viewof country"], (G, _) => G.input(_));
  main.variable(observer("viewof concatPlot")).define("viewof concatPlot", ["PM","vl","dataStack","getMonth","startMonth","country"], function(PM,vl,dataStack,getMonth,startMonth,country)
{
  let fieldStringAddition;
  let titleAddition;
  if (PM == "Yes"){
    fieldStringAddition = " PM";
    titleAddition = " per million inhabitants"
  }else{
    fieldStringAddition = "";
    titleAddition = ""

  }
  
  const stackedBar = vl.markBar({"tooltip":true})
    .data(dataStack.filter(d=> getMonth(d.time) >= startMonth & d.country === country))
    .title("Total cases"+titleAddition)
    .encode(
      vl.x().fieldT("time").axis({"title":null}),
      vl.y().fieldQ("value"+fieldStringAddition).axis({"title":null}), // .stack("normalize").axis({ format: "%" }),
      vl.color().fieldN("type").sort(["recovered", "confirmed", "death"]) // .scale({ range: weatherColors })
    )
  .width(700)
  .height(450)
  
  const stackedBarNewC = vl.markBar({"tooltip":true})
    .data(dataStack.filter(d => getMonth(d.time) >= startMonth & d.country === country & d.type === "confirmed"))
    .title("Newly reported cases"+titleAddition)
    .encode(
      vl.x().fieldT("time").axis({"title":null, "labels":true, "ticks":false}),
      vl.y().fieldQ("New value"+fieldStringAddition).axis({"title":null}),//.title(""), // .stack("normalize").axis({ format: "%" }),
      vl.color().fieldN("type") // .scale({ range: weatherColors })
    )
  .width(500)
  .height(130)
  const stackedBarNewD = vl.markBar({"tooltip":true})
    .data(dataStack.filter(d => getMonth(d.time) >= startMonth & d.country === country & d.type === "death"))
    .encode(
      vl.x().fieldT("time").axis({"title":null, "labels":true, "ticks":false}),
      vl.y().fieldQ("New value"+fieldStringAddition).axis({"title":null}),//.title(""), // .stack("normalize").axis({ format: "%" }),
      vl.color().fieldN("type") // .scale({ range: weatherColors })
    )
  .width(500)
  .height(130)
  
  const stackedBarNewR = vl.markBar({"tooltip":true})
    .data(dataStack.filter(d => getMonth(d.time) >= startMonth & d.country === country & d.type === "recovered"))
    .encode(
      vl.x().fieldT("time").axis({"title":null}),
      vl.y().fieldQ("New value"+fieldStringAddition).axis({"title":null}),//.title(""), // .stack("normalize").axis({ format: "%" }),
      vl.color().fieldN("type") // .scale({ range: weatherColors })
    )
  .width(500)
  .height(130)
  return vl.hconcat(stackedBar, 
                    vl.vconcat(stackedBarNewC, stackedBarNewD, stackedBarNewR)
                      .config({concat:{spacing:0}})
                   )
    .config({ concat: { spacing: 10 } })
    .render();
}
);
  //main.variable(observer("concatPlot")).define("concatPlot", ["Generators", "viewof concatPlot"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md``
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 2. Does quarantine help?`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
An interesting way to get some insight into how measures are working to prevent spreading of the virus we make the following plot. This plot is inspired by minutephysics, please have a look here https://www.youtube.com/watch?v=54XLXg4fYsc. It uses the fact that newly reported cases are proportional to existing cases, if no measures are taken. So in a plot they should show a linear trend. Deviations from this trend could indicate effects of measures taken against the spread of the virus.

We show this plot below. The plot is seperated for countries with high and low values for clarity. If you want to see the numbers scaled to the number of inhabitants, please select this at the top of this webpage. Hover over the points to get details.
`
)});
  main.variable(observer("viewof corrPlot")).define("viewof corrPlot", ["PM","vl","dataStack"], function(PM,vl,dataStack)
{
  const setLarge = ["Italy", "China", "Spain", "France", "Germany", "United Kingdom"]

  
  let axisAddition, fieldStringAddition;
  if (PM == "Yes"){
    axisAddition = " per million inhabitants"
    fieldStringAddition = " PM";
  }else{
    axisAddition = ""
    fieldStringAddition = "";
  }
  

  
  const plotCorrSmall = vl.layer(
    vl.markLine({"tooltip":true, "point":true})
    .data(dataStack.filter(d => !setLarge.includes(d.country)))
    .title("Zoom into the smaller countries")
    .encode(
      vl.color().fieldN("country"),
      vl.x().fieldQ("value"+fieldStringAddition).title("Total confirmed cases"+axisAddition).bin({"maxbins": 50}),
      vl.y().fieldQ("New value"+fieldStringAddition).title("").aggregate("mean"),
    )
   )
   .width(600)
   .height(450)
  
  const plotCorrBig = vl.layer(
    vl.markLine({"tooltip":true, "point":true})
    .data(dataStack.filter(d => setLarge.includes(d.country)))
    .title("Countries with large populations")
    .encode(
      vl.color().fieldN("country"),
      vl.x().fieldQ("value"+fieldStringAddition)
        .title("Total confirmed cases"+axisAddition)
        .bin({"maxbins": 50}),
      vl.y().fieldQ("New value"+fieldStringAddition)
        .title("New confirmed cases"+axisAddition)
        .aggregate("mean"),
    )
    )
    .width(600)
    .height(450)
    

  return vl.hconcat(plotCorrBig, plotCorrSmall)
    .config({ concat: { spacing: 0 } })
    .render()
  
}
);
  //main.variable(observer("corrPlot")).define("corrPlot", ["Generators", "viewof corrPlot"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`

`
)});

  main.variable(observer("countryOptionsSelection")).define("countryOptionsSelection",["Germany", "Italy", "France", "Spain", "Switzerland", "Austria", "Belgium", "United Kingdom", "Japan", "China", "Netherlands"]
);
  main.variable(observer("dataStack")).define("dataStack", ["dataRawConf","dataRawDeath","dataRawRecov","dataPop","countryOptionsSelection"], function(dataRawConf,dataRawDeath,dataRawRecov,dataPop,countryOptionsSelection)
{  
  let calcPerCountry = function(useCountry){
    let dataTempC = dataRawConf.filter(function(d) {    return d["Country/Region"] === useCountry})
    let dataTempD = dataRawDeath.filter(function(d) {    return d["Country/Region"] === useCountry})
    let dataTempR = dataRawRecov.filter(function(d) {    return d["Country/Region"] === useCountry})

    let dataNew = [];
    let keyRecov;
    let keys = Object.keys(dataTempD[0]);
    
    // We first walk over the keys. The columns are first some informations 
    // (country, province, location) and then a long series of dates. We want
    // to extract the dates.
    keys.forEach(function(key, i) {
      if(key !== "Province/State" & 
         key !== "Country/Region" & 
         key !== "Lat" & 
         key !== "Long"){
    
        // Every row contains one counting of either confirmed cases, deaths 
        // or recovered patients. We want to add them together for the different
        // provinces in a country to get the total of the country.
        let newDeaths = 0, // Newly reported values of the day
            newConf = 0, 
            newRecov = 0,
            deaths = 0, // Total values
            conf = 0, 
            recov = 0;
        for (let j = 0; j < dataTempC.length; j++){
          // We start with calculating the recovered cases. This list
          // is a bit nasty because its length and formatting sometimes
          // differes from the deaths and confirmed cases.
          if (j < dataTempR.length){            
            // For some entries in the recovered column the date 
            // is listed as 2020 and in others as 20. 
            // So we need to check for this at every entry.
            if(dataTempR[j][keys[i]+"20"]){
              keyRecov = keys[i]+"20";
            }else if(dataTempR[j][keys[i]]){
              keyRecov = keys[i]
            }
            // When calculating changes in the daily reported numbers,
            // we need to check if we are not at the first date.
            if (i !== 4){
              if (dataTempR[j][keys[i-1]+"20"]){
                newRecov += Math.abs(parseFloat(dataTempR[j][keyRecov]) - parseFloat(dataTempR[j][keys[i-1]+"20"]))
              }else if (dataTempR[j][keys[i-1]]){
                newRecov += Math.abs(parseFloat(dataTempR[j][keyRecov]) - parseFloat(dataTempR[j][keys[i-1]]))
              }
            // If this is the first day, we take the the values as
            // as the increase for the day
            }else{
              newRecov += Math.abs(parseFloat(dataTempR[j][keyRecov]))
            }
            recov += Math.abs(parseFloat(dataTempR[j][keyRecov]));
          }

          // We now calculate the confirmed cases and the deaths
          // 
          // Again if this is not the first date entry we can 
          // calculate the difference in stats with the previous
          // day
          if (i !== 4){
            newDeaths += Math.abs(parseFloat(dataTempD[j][keys[i]]) - parseFloat(dataTempD[j][keys[i-1]]))
            newConf += Math.abs(parseFloat(dataTempC[j][keys[i]]) - parseFloat(dataTempC[j][keys[i-1]]))
          // If this is the first day, we take the the values as
          // as the increase 
          }else{
            newDeaths += parseFloat(dataTempD[j][keys[i]])
            newConf += parseFloat(dataTempC[j][keys[i]])
            // newRecov += parseFloat(dataTempR[j][keyRecov])
          }
          deaths += parseFloat(dataTempD[j][keys[i]]);
          conf += parseFloat(dataTempC[j][keys[i]]);
        }
        // We now push entries into the array for all the new
        // values.
        dataNew.push({"time": key, 
                      "value": conf, 
                      "New value": newConf,
                      "value PM": conf/dataPop, 
                      "New value PM": newConf/dataPop,
                      "type": "confirmed",
                      "country":useCountry});
        dataNew.push({"time": key, 
                      "value": deaths, 
                      "New value":newDeaths,
                      "value PM": deaths/dataPop, 
                      "New value PM":newDeaths/dataPop,
                      "type": "death",
                      "country":useCountry});
        dataNew.push({"time": key, 
                      "value": recov, 
                      "New value": newRecov, 
                      "value PM": recov/dataPop, 
                      "New value PM": newRecov/dataPop, 
                      "type": "recovered",
                      "country":useCountry});
      }
    })
    return dataNew;
  }

  // Here we loop over all the choosen countries to calculate
  // their values and add them to the final array that is
  // returned.
  let dataAllCountryOptions = []
  countryOptionsSelection.forEach(function(d, i){
    dataAllCountryOptions = dataAllCountryOptions.concat( calcPerCountry(d) );
  })
  
  return dataAllCountryOptions;
}
);


// Loading external packages.
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  const child1 = runtime.module(define1);
  main.import("table", child1);
  const child2 = runtime.module(define2);
  main.import("vl", child2);
  const child3 = runtime.module(define3);
  main.import("select", child3);
  
  main.variable(observer()).define(["md"], function(md){return(
md` See data descriptions here: https://github.com/CSSEGISandData/COVID-19`
)});


// Getting data from John Hopkins CSSE URls
  main.variable(observer("urlConf")).define("urlConf", function(){return(
"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
)});
  main.variable(observer("urlDeath")).define("urlDeath", function(){return(
"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
)});
  main.variable(observer("urlRecovered")).define("urlRecovered", function(){return(
"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"
)});


// Reading in data directly from CSV files for confirmed cases, deaths and recovered people.
  main.variable(observer("dataRawConf")).define("dataRawConf", ["d3","urlConf"], function(d3,urlConf){return(
d3.csv(urlConf)
)});
  main.variable(observer("dataRawDeath")).define("dataRawDeath", ["d3","urlDeath"], function(d3,urlDeath){return(
d3.csv(urlDeath)
)});
  main.variable(observer("dataRawRecov")).define("dataRawRecov", ["d3","urlRecovered"], function(d3,urlRecovered){return(
d3.csv(urlRecovered)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## For the population estimates we use another API
https://restcountries.eu/#api-endpoints-all

`
)});
  main.variable(observer("dataCountryInfo")).define("dataCountryInfo", ["d3","country"], function(d3,country){return(
d3.json("https://restcountries.eu/rest/v2/name/"+country)
)});
  main.variable(observer("dataPop")).define("dataPop", ["dataCountryInfo"], function(dataCountryInfo){return(
dataCountryInfo[0]["population"]/1000000
)});
  main.variable(observer("getMonth")).define("getMonth", function(){return(
d => parseFloat(d.split("/")[0])
)});

  // miscellaneous
  main.variable(observer("startMonth")).define("startMonth", ["country"], function(country)
{
  let startMonth;
  if(country === "China"){
    startMonth = 1;
  }else{
    startMonth = 3;
  }
   return startMonth
}
);
  return main;
}
