var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var qs = require('qs');
var session = require('express-session')
var cheerio = require('cheerio');

var app = express();

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

axios.defaults.baseURL = 'https://etk.srail.co.kr';

app.post('/login', function (req, res) {
  axios.post('/cmc/01/selectLoginInfo.do?pageId=TK0701000000', qs.stringify({
    srchDvNm: req.body.userNumber,
    hmpgPwdCphd: req.body.userPassword,
    srchDvCd: '1'
  })).then(function (response) {
    if (response.data && response.data.includes('location.replace(\'/main.do\');')) {
      // 로그인 성공
      // 쿠키값 세션에 저장
      if (response.headers && response.headers['set-cookie'] && response.headers['set-cookie'].length > 0) {
        sessionKey = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
        req.session['JSESSIONID_ETK'] = sessionKey;
      }
      res.status(200).send('success');
    } else {
      res.status(500).send('invalid id or password');
    }
  }).catch(function (error) {
    res.status(500).send('server error');
  });
});

app.get('/trainList', function (req, res) {
  var startStation = req.query.startStation;
  var startStationNumber = req.query.startStationNumber;
  var endStation = req.query.endStation;
  var endStationNumber = req.query.endStationNumber;
  var requestDate = req.query.requestDate;
  var requestTime = req.query.requestTime;
  axios.post('/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000', qs.stringify({
    dptRsStnCd: startStationNumber,
    arvRsStnCd: endStationNumber,
    stlbTrnClsfCd: '05',
    psgNum: '1',
    seatAttCd: '015',
    isRequest: 'Y',
    dptRsStnCdNm: startStation,
    arvRsStnCdNm: endStation,
    dptDt: requestDate,
    dptTm: requestTime + '00',
    chtnDvCd: '1',
    psgInfoPerPrnb1: '1',
    psgInfoPerPrnb5: '0',
    psgInfoPerPrnb4: '0',
    psgInfoPerPrnb2: '0',
    psgInfoPerPrnb3: '0',
    locSeatAttCd1: '000',
    rqSeatAttCd1: '015',
    trnGpCd: '300'
  })).then(function (response) {
    var $ = cheerio.load(response.data);
    trainList = [];
    $('#result-form table tbody tr').each(function(trIndex, trElem) {
      tdElem = $(trElem).find('td');
      if (tdElem.length == 11) {
        var trainNumber = $(tdElem[2]).text().trim();
        var startTime = $(tdElem[3]).text().trim();
        var endTime = $(tdElem[4]).text().trim();
        // var canSpecialSeat = $(tdElem[5]).text().trim().includes('예약하기');
        // var canCommonSeat = $(tdElem[6]).text().trim().includes('예약하기');
        var duration = $(tdElem[10]).text().trim();
        trainInfo = {
          trainNumber: trainNumber,
          startTime: startTime,
          endTime: endTime,
          duration: duration
        }
        trainList.push(trainInfo);
      }
    });
    res.status(200).send(trainList);
  }).catch(function (error) {
    res.status(500).send('server error');
  });
});

app.post('/checkLogin', function(req, res) {
  if (req.session['JSESSIONID_ETK']) {
    res.status(200).send('logged in');
  } else {
    res.status(500).send('not logged in');
  }
});

app.post('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      res.status(500).send('server error');
    } else {
      res.status(200).send('loggout');
    }
  })
})

app.get('/stationList', function(req, res) {
  axios.post('/hpg/hra/01/selectMapInfo.do?isAll=Y&other=&target=dpt&pageId=TK0101010000')
  .then(function (response) {
    var $ = cheerio.load(response.data);
    var stationList = [];
    $('#wrap .map>ul>li').each(function(index, elem) {
      $(elem).find('ul li').each(function(i, e) {
        var aTag = $(e).find('a');
        if (aTag.length > 0) {
          var clickEvent = $(aTag[0]).attr('onclick').split('\'');
          var id = clickEvent[1];
          var name = clickEvent[3];
          stationList.push({
            id: id,
            name: name
          });
        }
      });
    });
    res.status(200).send(stationList);
  })
  .catch(function (error) {
    res.status(500).send('server error');
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
