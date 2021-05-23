import React, { useState, useEffect } from "react";
import {MenuItem,FormControl,Select, Card, CardContent} from "@material-ui/core"
import InfoBox from "./InfoBox"
import './App.css';
import Map from "./Map";
import Table from "./Table"
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css"

function App() {

const [countries, setCountries] = useState([]);
const [country, setCountry] = useState('worldwide')
const [countryInfo, setCountryInfo] = useState({})
const [tableData, setTableData] = useState([])
const [countryVaccineInfo, setCountryVaccineInfo]= useState({})
const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796})
const [mapZoom, setMapZoom] = useState(3)
const [mapCountries, setMapCountries] = useState([]);
const [casesType, setCasesType] = useState("cases");

useEffect(()=>{
  fetch("https://disease.sh/v3/covid-19/all")
  .then(response=> response.json())
  .then(data=>{
    setCountryInfo(data)
  })
},[])

/*useEffect(()=>{
  const getVaccinesData = async()=>{
    await fetch(`https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=1`)
  }
},[])
*/

useEffect(()=>{
  //The code inside here will run once
  // when the component loads and not again
  const getCountriesData = async () => {
    await fetch ("https://disease.sh/v3/covid-19/countries")
    .then((response)=> response.json())
    .then((data)=>{
        const countries = data.map((country)=>(
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
          const sortedData = sortData(data);
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)

    })
  }

    getCountriesData();
},[])

    const onCountryChange = async (event) => {
      const countryCode = event.target.value;
      setCountry(countryCode);

      const url = countryCode === 'worldwide'
       ? 'https://disease.sh/v3/covid-19/all' 
       : `https:disease.sh/v3/covid-19/countries/${countryCode}`
      
      await fetch(url)
      .then(response => response.json())
      .then(data =>{
        setCountry(countryCode);
        //All of the data
        setCountryInfo(data);
      })
      const urlvaccines = countryCode ==='worldwide' ? 'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=1&fullData=false'
      : `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=1&fullData=false`
      
      await fetch(urlvaccines)
      .then(response=>response.json())
      .then(data=>{
        setCountryVaccineInfo(data);
      })

      
    };
    console.log(countryVaccineInfo["timeline"])
  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
       <h1>COVID-19 TRACKER</h1>
       <FormControl className="app__dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>
         <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country)=>(<MenuItem value={country.value}>{country.name}</MenuItem>))}
      </Select>
    </FormControl>
    </div>

   <div className="app__stats">
     <InfoBox title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)}total={countryInfo.cases}/>
    <InfoBox title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)}total={countryInfo.recovered}/>
    <InfoBox title="Deaths"cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths}/>      
   <InfoBox title="Vaccinations" cases={countryVaccineInfo["timeline"]?Object.values(countryVaccineInfo["timeline"]):Object.values(countryVaccineInfo)}/>
   </div>


   <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
    </div> 
    <Card className="app__right">
      <CardContent>
        <h3>Live Cases by Country</h3>
        <Table countries={tableData}/>
        <h3>Worldwide new cases</h3>
        <LineGraph/>

      </CardContent>
    </Card>
</div>
  );
}

export default App;
