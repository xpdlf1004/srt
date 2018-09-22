<template id="alertForm">
  <div class="container">
    <h4>알람 등록</h4>
    <div v-if="!isKakaoLogin">
      <a id="kakao-login-btn" ref="kakaoLoginBtn"></a>
      <p class="text-muted">카카오톡 나에게 메시지 보내기
      </p>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked v-model="isSoundAlertChecked">
      <label class="form-check-label" for="defaultCheck1">
        예약 완료시 소리로 알림
      </label>
      <audio controls class="d-none" ref="alertAudio">
        <source src="alarm.ogg" type="audio/ogg">
        <source src="alarm.mp3" type="audio/mpeg">
      </audio>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertForm',
  props: ['isKakaoLogin'],
  data: function () {
    return {
      isSoundAlertChecked: true
    };
  },
  created: function () {
    this.$parent.$on('alert-success', this.alertSuccess);
  },
  mounted: function () {
    var component = this;
    var loginBtnEl = this.$refs.kakaoLoginBtn;
    Kakao.Auth.createLoginButton({
      container: loginBtnEl,
      success: function (authObj) {
        $.post({
          url: '/kakaoLogin',
          data: {
            accessToken: authObj.access_token,
            refreshToken: authObj.refresh_token,
            expiresIn: authObj.expires_in
          },
          success: function (data, textStatus, request) {
            component.$emit('kakao-login-success');
          }
        });
      },
      fail: function (err) {
        alert(JSON.stringify(err));
      }
    });
  },
  methods: {
    alertSuccess: function () {
      if (this.isSoundAlertChecked) {
        this.$refs.alertAudio.play();
      }
    }
  }
}
</script>
