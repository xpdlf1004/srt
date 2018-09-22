<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#">SRT 메크로</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <!--
                <a class="nav-link" href="#">Home</a>
              -->
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item" v-if="initialized && isKakaoLogin">
            <a class="nav-link" href="#">카카오톡 알림중...</a>
          </li>
          <li class="nav-item" v-if="initialized && isLogin">
            <a class="nav-link" href="#" @click="logout">로그아웃</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="w-100">
      <loading v-if="!initialized"></loading>
      <div v-if="initialized && !isLogin" class="py-3">
        <login-form @login-succeed="loginSucceed"></login-form>
      </div>
      <div v-if="initialized && isLogin" class="py-3">
        <!-- 알람 등록 -->
        <alert-form class="pb-3" :is-kakao-login="isKakaoLogin" @kakao-login-success="kakaoLoginSuccess"></alert-form>
        <!-- 메크로리스트 -->
        <macro-list class="pb-3" :macro-list="macroList" @macro-success="handleMacroSuccess" @invalid-token="handleInvalidToken"></macro-list>
        <!-- 열차 조회 -->
        <train-request-form @train-searched="trainSearched"></train-request-form>
        <!-- 조회 결과 -->
        <train-list v-if="trainSearchRequested" :train-list="searchedTrain" @add-macro="addMacro"></train-list>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import AlertForm from "./components/AlertForm.vue";
import Loading from "./components/Loading.vue";
import LoginForm from "./components/LoginForm.vue";
import MacroList from "./components/MacroList.vue";
import TrainList from "./components/TrainList.vue";
import TrainRequestForm from "./components/TrainRequestForm.vue";

function notifyMe() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }
  else if (Notification.permission === "granted") {
    var notification = new Notification("I got a ticket!");
  }
}

Vue.use(Toasted, {
  position: 'bottom-right',
  duration: 1500,
  closeOnSwipe: false
});

export default {
  name: "App",
  components: { AlertForm, Loading, LoginForm, MacroList, TrainList, TrainRequestForm },
  data: () => ({
    isLogin: false,
    initialized: false,
    trainSearchRequested: false,
    searchedTrain: [],
    searchedDate: "",
    searchedStartStation: "",
    searchedEndStation: "",
    macroList: [],
    isKakaoLogin: false
  }),
  methods: {
    loginSucceed: function () {
      this.isLogin = true;
      if (Notification.permission === "default") {
        Notification.requestPermission(function (permission) {
          if (permission === "granted") {
            var notification = new Notification("티켓이 잡히면 알려드릴게요:)");
          }
        });
      }
    },
    logout: function () {
      $.post({
        url: '/logout',
        success: function (data, textStatus, request) {
          this.isLogin = false;
          this.isKakaoLogin = false;
          this.searchedTrain = [];
          this.macroList = [];
        }.bind(this),
        error: function (request, textStatus, errorThrown) {
        }.bind(this)
      })
    },
    handleInvalidToken: function () {
      this.isLogin = false;
      this.isKakaoLogin = false;
      this.searchedTrain = [];
      this.macroList = [];
      this.errorToast('세션이 만료되었습니다.');
    },
    trainSearched: function (data) {
      this.searchedTrain = data.trainData;
      this.searchedDate = data.date;
      this.searchedStartStation = data.startStation;
      this.searchedEndStation = data.endStation;
      this.trainSearchRequested = true;
    },
    showToast: function (message) {
      this.$toasted.show(message);
    },
    errorToast: function (message) {
      this.$toasted.error(message);
    },
    successToast: function (message) {
      this.$toasted.success(message);
    },
    kakaoLoginSuccess: function () {
      this.isKakaoLogin = true;
    },
    handleMacroSuccess: function () {
      this.$emit('alert-success');
    },
    addMacro: function (data) {
      if (this.macroList.length >= 10) {
        this.errorToast('최대 10개까지 등록 가능합니다.');
        return;
      }
      this.macroList.push({
        date: this.searchedDate,
        startStation: this.searchedStartStation,
        endStation: this.searchedEndStation,
        startTime: data.startTime,
        endTime: data.endTime,
        trainNumber: data.trainNumber,
        isCommon: data.isCommon,
        status: 'running'
      });
      this.successToast('메크로 리스트에 등록되었습니다.');
    }
  },
  created: function () {
    $.post({
      url: '/checkLogin',
      success: function (data, textStatus, request) {
        this.isLogin = true
      }.bind(this),
      error: function (request, textStatus, errorThrown) {
        this.isLogin = false
      }.bind(this),
      complete: function () {
        this.initialized = true
      }.bind(this)
    });
  }
}

</script>
