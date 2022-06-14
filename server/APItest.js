const axios = require('axios')
const Bottleneck = require("bottleneck") 
const API_KEY = "RGAPI-227b63fe-28d8-4483-9b8b-b2554e85e98b"


//Information from getting summoner by name 
const playerName = "Blakrare"
const accountID = "NkMX8PX290EcAwomugDlAuBozDY6p4d-dsG-owk2R1RiVCI"
const id = "uwrknQhvs7SRlbw3LwDlJWpTRsPKigt976KFs44a588FfDY"
const puuid = "4jigHknWVKhvkNyLG8zfv8hQMZ_g8tk67mtBjJLRG_3MY1SPJ5TDb0voMdccgVu6xoRMgojLtGSD7Q"
const profileIconID = 1114
const revisionDate = 1655003526000
const summonerLevel = 187

const limiter = new Bottleneck({
    minTime:500
})
const throttledgetMatchData = limiter.wrap(getMatchesInformation)

axios.get("https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/"+puuid+"/ids"+"?api_key=" + API_KEY).then((res) => {
    const matchIDs = res.data
    

        matchIDs.map(id => {
            throttledgetMatchData(id)
        })
}).catch((err) =>{
    console.log(err)
})


function getMatchesInformation(id) {
    axios.get("https://americas.api.riotgames.com/tft/match/v1/matches/"+ id +"?api_key=" + API_KEY).then((res) => {

            console.log(res.data.metadata.match_id)
        }).catch((err)=> {
            console.log(err)
        })
}









