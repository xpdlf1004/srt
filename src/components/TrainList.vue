<template id="trainList">
  <div class="container">
    <h4>열차 선택</h4>
    <div>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">열차 번호</th>
            <th scope="col">출발</th>
            <th scope="col">도착</th>
            <th scope="col">소요시간</th>
            <th scope="col">일반실</th>
            <th scope="col">특실</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="train in trainList">
            <th scope="row">{{train.trainNumber}}</th>
            <td>{{train.startTime}}</td>
            <td>{{train.endTime}}</td>
            <td>{{train.duration}}</td>
            <td><button type="button" class="btn btn-success" @click="addMacro(train, true)">등록</button></td>
            <td><button type="button" class="btn btn-success" @click="addMacro(train, false)">등록</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

export default {
  name: 'trainList',
  data: function () {
    return {}
  },
  props: ['trainList'],
  methods: {
    addMacro: function (data, isCommon) {
      var endTime = data.endTime;
      var startTime = data.startTime;
      var trainNumber = data.trainNumber;
      this.$emit('add-macro', {
        endTime: endTime,
        startTime: startTime,
        trainNumber: trainNumber,
        isCommon: isCommon
      });
    }
  }
}
</script>
