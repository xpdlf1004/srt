<template id="trainRequestForm">
  <div class="container">
    <h4>열차 조회</h4>
    <form>
      <div class="form-group">
        <label for="stationSelectStart">출발지</label>
        <select class="form-control" id="stationSelectStart" v-model="selectedStartStation">
          <option disabled value>선택</option>
          <option
            v-for="station in stationList"
            :key="station.id"
            v-bind:value="station.id"
          >{{station.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="stationSelectEnd">도착지</label>
        <select class="form-control" id="stationSelectEnd" v-model="selectedEndStation">
          <option disabled value>선택</option>
          <option
            v-for="station in stationList"
            :key="station.id"
            v-bind:value="station.id"
          >{{station.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="dateSelect">날짜</label>
        <input type="date" class="form-control" id="dateSelect" v-model="selectedDate">
      </div>
      <div class="form-group">
        <label for="timeSelect">시간</label>
        <select class="form-control" id="timeSelect" v-model="selectedTime">
          <option v-for="(timeDiff, index) in timeDiffList" :key="index">{{timeDiff}}</option>
        </select>
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!checkForm"
        @click.prevent="getTrainList"
      >조회</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "trainRequestForm",
  data: function() {
    return {
      stationList: [],
      timeDiffList: [
        "00",
        "02",
        "04",
        "06",
        "08",
        "10",
        "12",
        "14",
        "16",
        "18",
        "20",
        "22"
      ],
      selectedStartStation: "",
      selectedEndStation: "",
      selectedDate: new Date().toISOString().substring(0, 10),
      selectedTime: "00"
    };
  },
  computed: {
    checkForm: function() {
      return this.selectedStartStation !== "" && this.selectedEndStation !== "";
    }
  },
  methods: {
    getTrainList: function() {
      var selectedDate = _.clone(this.selectedDate).replace(/-/g, "");
      var selectedStartStation = this.selectedStartStation;
      var selectedStartStationName = _.find(this.stationList, function(sl) {
        return sl.id == selectedStartStation;
      }).name;
      var selectedEndStation = this.selectedEndStation;
      var selectedEndStationName = _.find(this.stationList, function(sl) {
        return sl.id == selectedEndStation;
      }).name;
      $.get({
        url: "/trainList",
        data: {
          startStation: selectedStartStationName,
          startStationNumber: selectedStartStation,
          endStation: selectedEndStationName,
          endStationNumber: selectedEndStation,
          requestDate: selectedDate,
          requestTime: this.selectedTime + "00"
        },
        success: function(data, textStatus, request) {
          this.$emit("train-searched", {
            date: selectedDate,
            startStation: selectedStartStation,
            endStation: selectedEndStation,
            trainData: data
          });
        }.bind(this),
        error: function(request, textStatus, errorThrown) {}.bind(this)
      });
    }
  },
  created: function() {
    $.get({
      url: "/stationList",
      success: function(data, textStatus, request) {
        this.stationList = data;
      }.bind(this),
      error: function(request, textStatus, errorThrown) {}.bind(this)
    });
  }
};
</script>
