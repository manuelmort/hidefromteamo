const mongoose = require('mongoose')
const bodyParser = require('body-parser');

var axios = require('axios')
var express = require("express");
const cors = require('cors');
const path = require('path');
const { error } = require('console');
const res = require('express/lib/response');
const { nextTick } = require('process');
var app = express();

const PORT = process.env.PORT || 8080
app.use(bodyParser.json());
app.use(cors());
var API_KEY = "RGAPI-227b63fe-28d8-4483-9b8b-b2554e85e98b"
var DB_KEY = "mongodb+srv://bluerare:manuel09!@vespacluster.4zhfz.mongodb.net/TFTapp?retryWrites=true&w=majority"
var tftSchema = mongoose.Schema({
    id:String,
    accountId:String,
    puuid:String,
    name:String,
    profileIconId:String,
    summonerLevel:String,
    tftTier:String,
    tftRank:String,
    tftLp:String

})


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle React routing, return all requests to React app
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
var Data = mongoose.model('Data', tftSchema)//creating a collection
var searchedPlayerData = mongoose.model('searchedPlayer', tftSchema)//creating a collection


mongoose.connect(DB_KEY,function(err) {
    if(err) throw err;

    console.log("Database has successfully connected")

    addingData();
   

})



    
app.get('/tft-leaderboard',function(req,res) {
    Data.find({},function(err,result){
        if (err) throw (err)
        res.send(result)
    })
})

app.post('/',(req,send) => {
    axios.get("https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-name/"+ req.body.searchedPlayer +"?api_key=" + API_KEY).then((res) => {
            var puuid = res.data.puuid
            
            axios.get("https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/" + res.data.id + "?api_key=" + API_KEY).then((result) => {
                //axios request to grab summoner rank information from using the summoner id
                tier = result.data[0].tier
                rank = result.data[0].rank
                lp = result.data[0].leaguePoints
                var playerinfo = {
                    name:req.body.searchedPlayer,
                    tier: tier,
                    rank:rank,
                    lp:lp,
                    puuid: puuid
                }
                send.send(playerinfo)                                
                

            }).catch((err) => {
                console.log(err)
            })

        }).catch((err) => {
            console.log(err)
        })
  
})

app.get('/',function(req,res) {
    res.send("testing get")
})





app.get('/search',function(req,res) {
    
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
    
})


//api calls to refresh given leaderboard
function addingData() {
    Data.deleteMany({},function(res,req) {
    })
    var rank
    var tier
    var lp

    //these names are hard coded, which means if the player changes their name, this app is screwed
    nameArray = ["Blakrare", "Lillichubbs","CayTeaLeaf","AmdoSavior","HidefromteaMO","Ponality"]

    nameArray.map((item) => {
        axios.get("https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-name/"+item+"?api_key=" + API_KEY).then((res) => {
            //axios request to grab id of the summoner

            axios.get("https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/" + res.data.id + "?api_key=" + API_KEY).then((result) => {
                //axios request to grab summoner rank information from using the summoner id
                
                
                if(result.data[0].rank == null) {
                    rank = "unranked"
                }else {
                    rank = result.data[0].rank
                }
                tier = result.data[0].tier
                lp = result.data[0].leaguePoints
                
                
                onSuccess(res,rank,tier,lp)
                

            }).catch((err) => {
                console.log(err)
            })

        }).catch((err) => {
            console.log(err)
        })
    })
    
    console.log("Refreshing api Data")

    setTimeout(addingData,900000)//refreshing data every 15 minutes
    
}
//api calls to when a player is searched



//this function will store api data into local variables
function onSuccess(res, playerRank,playerTier,playerLp){
    var array = res.data

    var arrayLength = Object.keys(array).length

    for(var i = 0; i <=arrayLength;i++){

        var playerId = array.id
        var playerAccountID = array.accountId
        var playerPuuid = array.puuid
        var playerName = array.name
        var playerIcon = array.profileIconId
        var playerLevel = array.summonerLevel
        
    
       
    }

    assignDataValue(playerId,playerAccountID,playerPuuid,playerName,playerIcon,playerLevel,playerTier,playerRank, playerLp)
}


//will grab local variables in onSuccess and assign them to keys in db schema for upload
function assignDataValue(id, accountId,puuid,name,profileIconId,summonerLevel,summonerTier,summonerRank, summonerLp) {
    var uploadData = new Data()
    uploadData.id = id;
    uploadData.accountId = accountId
    uploadData.puuid = puuid
    uploadData.name = name
    uploadData.profileIconId = profileIconId
    uploadData.summonerLevel = summonerLevel
    uploadData.tftTier = summonerTier
    uploadData.tftRank = summonerRank
    uploadData.tftLp = summonerLp
    
    

    uploadData.save();
   
}
