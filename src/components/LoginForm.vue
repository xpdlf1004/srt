<template id="loginForm">
  <div class="container">
    <h4>로그인</h4>
    <form>
      <div class="form-group">
        <label for="userNumber">회원번호</label>
        <input type="text" class="form-control" v-model="userNumber" id="userNumber" placeholder="회원번호">
      </div>
      <div class="form-group">
        <label for="userPassword">비밀번호</label>
        <input type="password" class="form-control" v-model="userPassword" id="userEmail" placeholder="비밀번호">
      </div>
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>안심하세요!</strong> 서버에 어떠한 개인 정보도 남기지 않습니다.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <button type="submit" class="btn btn-primary" @click.prevent="login">로그인</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "loginForm",
  data: function() {
    return {
      userNumber: "",
      userPassword: ""
    };
  },
  methods: {
    login: function() {
      $.post({
        url: "/login",
        data: {
          userNumber: this.userNumber,
          userPassword: this.userPassword
        },
        success: function(data, textStatus, request) {
          this.$emit("login-succeed");
        }.bind(this),
        error: function(request, textStatus, errorThrown) {
          alert("유저 번호나 비밀번호가 틀렸습니다.");
        }.bind(this)
      });
    }
  }
};
</script>
