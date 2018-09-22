<template>
  <div class="container">
    <h4>메크로 리스트</h4>
    <p v-if="macroList.length === 0">등록된 메크로가 없습니다.</p>
    <ul class="list-inline">
      <li class="list-inline-item" v-for="(macro, index) in macroList">
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">
              <span v-if="macro.status==='running'"><i class="fa fa-spinner fa-spin"></i> 동작중 ...</span>
              <span v-if="macro.status==='done'" class="text-success">예약성공</span>
              <span v-if="macro.status==='error'" class="text-danger">중단</span>
            </h5>
            <p class="card-text">
              날짜 : {{macro.date}}<br />
              번호 : {{macro.trainNumber}}<br />
              출발 : {{macro.startTime}}<br />
              도착 : {{macro.endTime}}<br />
              종류 : {{macro.isCommon?'일반실':'특실'}}
            </p>
            <a v-if="macro.status==='running' || macro.status==='error'" href="#" class="card-link" @click="removeMacroRequest(index)">삭제</a>
            <a v-if="macro.status==='error'" href="#" class="card-link pull-right" @click="restartMacroRequest(index)">재시작</a>
            <a v-if="macro.status==='done'" href="https://etk.srail.co.kr/hpg/hra/02/selectReservationList.do?pageId=TK0102010000"
              target="_blank" class="card-link">10분안에 결제하기</a>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'macroList',
  props: ['macroList'],
  data: function () {
    return {
      macroIntervalPID: ''
    }
  },
  methods: {
    removeMacroRequest: function (index) {
      this.macroList.splice(index, 1);
    },
    restartMacroRequest: function (index) {
      this.macroList[index].status = 'running';
    },
    requestMacro: function () {
      console.log('macro loop is running...');
      var component = this;
      var macroList = this.macroList;
      $(macroList).each(function () {
        var macro = this;

        // 예약 완료 상태에서 10분 지났을 경우 running으로 변경
        if (macro.status === 'done') {
          var diffMillSec = new Date().getTime() - macro.doneTime;
          if (diffMillSec > 10 * 60 * 1000) {
            macro.status = 'running';
          }
        }

        // error 나 done일 경우 취소
        if (macro.status !== 'running') {
          return true;
        }

        var startDate = macro.date;
        var splitedTime = macro.startTime.split(' ')[1].split(':')
        var startTime = splitedTime[0] + splitedTime[1] + '00';
        var trainNumber = '0000000' + macro.trainNumber;
        trainNumber = trainNumber.substring(trainNumber.length - 5);
        $.post({
          url: '/reserveTrain',
          data: {
            startDate: macro.date,
            startTime: startTime,
            trainNumber: trainNumber,
            startStation: macro.startStation,
            endStation: macro.endStation,
            seatType: macro.isCommon ? '1' : '2',
          },
          success: function (data, textStatus, request) {
            if (data === 'ok') {
              macro.status = 'done';
              macro.doneTime = new Date().getTime();

              // 카카오톡 메시지 전송
              $.post({
                url: '/kakaoMessage'
              });
              notifyMe();
              // 부모쪽으로 성공 이벤트 전송
              component.$emit('macro-success');
            } else if (data === 'full') {
              console.log(macro.startTime + ' => 매진');
            }
          },
          error: function (request, textStatus, errorThrown) {
            if (request.responseText === 'invalid token') {
              component.$emit('invalid-token');
            } else if (request.responseText === 'unknown error') {
              console.log('알수없는 오류..');
            } else if (request.responseText === 'external server error') {
              // 외부 서버 에러일 경우에 5번까지 봐줌
              if (macro.errorCount) {
                if (macro.errorCount > 5) {
                  macro.status = 'error';
                  macro.errorReason = 'SRT 홈페이지 에러';
                  macro.errorCount = null;
                } else {
                  macro.errorCount = macro.errorCount + 1;
                }
              } else {
                macro.errorCount = 1;
              }
            } else if (request.responseText === 'invalid param') {
              macro.status = 'error';
              macro.errorReason = '잘못된 정보로 요청하였습니다.';
            } else if (request.responseText === 'invalid time') {
              macro.status = 'error';
              macro.errorReason = '20분 이내의 열차는 예약할 수 없습니다.';
            } else {
              macro.status = 'error';
              macro.errorReason = request.responseText;
            }
          }
        });
      });
    }
  },
  created: function () {
    // 10sec for macro
    console.log('macro loop is started.');
    this.macroIntervalPID = setInterval(this.requestMacro, 10000);
  },
  beforeDestroy: function () {
    console.log('macro loop is stopped.');
    clearInterval(this.macroIntervalPID);
  }
}
</script>
