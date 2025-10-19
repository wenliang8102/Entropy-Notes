<template>
    <div class="square-container">
      <!-- 三层正方形 -->
      <div class="square square-white"></div>
      <div class="square square-light-blue"></div>
      <div class="square square-deep-blue"></div>

      <img class="logo" src="/logo.png">
      <!-- 左侧文案 -->
      <div class="hero">
        <div class="hero-title">Entropy notes</div>
        <div class="hero-subtitle">笔记熵减，知识赋能</div>
      </div>
      <!-- 登录表单 -->
      <div class="login-form-container">
        <form class="login-form">
          <!-- Logo区域 -->
          <div class="logo-container">
            <div class="logo-text">Entropy notes</div>
          </div>
          
          <div class="form-group">
            <div class="form-row">
              <label class="form-label">用户名</label>
              <input type="text" class="form-input" v-model="formData.username" />
            </div>
          </div>
          
          <div class="form-group">
            <div class="form-row">
              <label class="form-label">密码</label>
              <input type="password" class="form-input" v-model="formData.password" />
            </div>
          </div>
          
          <div class="form-group">
            <div class="form-row">
              <label class="form-label">验证码</label>
              <div class="captcha-group">
                <input type="text" class="form-input captcha-input" v-model="formData.captcha" />
                <img class="captcha-img" src="/captcha.png" alt="captcha" />
              </div>
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox" v-model="formData.rememberPassword" />
              <span class="checkbox-text">记住密码</span>
            </label>
            <div class="links">
              <a href="#" class="link" @click.prevent="handleNoAccount">没有账户?</a>
              <a href="#" class="link register-link" @click.prevent="handleRegister">马上注册</a>
            </div>
          </div>
          <button type="button" class="login-btn" @click="handleLogin">登 录</button>
        </form>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const formData = ref({
  username: '',
  password: '',
  captcha: '',
  rememberPassword: false
})

// 事件处理函数（预留）
function handleLogin() {
  console.log('登录数据:', formData.value)
  // TODO: 实现登录逻辑
  router.push('/notebook')
}

function handleNoAccount() {
  console.log('没有账户')
  // TODO: 实现没有账户的处理逻辑
}

function handleRegister() {
  console.log('马上注册')
  // TODO: 实现注册逻辑
}

function goNotebook() {
  router.push('/notebook')
}
</script>

<style scoped>
.logo {
  position: absolute;
  top: 34%;
  left: 65%;
  transform: translate(-50%, -50%);
  width: 7vh;
  height: 7vh;
  object-fit: contain;
  z-index: 5;
}
/* 左侧大标题与副标题 */
.hero {
  position: absolute;
  left: 12vw; /* 靠左一些，视觉平衡 */
  top: 40vh;  /* 纵向略居中偏上 */
  color: #ffffff;
  pointer-events: none; /* 避免遮挡交互 */
}
.hero-title {
  font-size: 3.2vw; /* 大标题 */
  font-weight: 800;
  font-style: italic;
  line-height: 1.2;
  letter-spacing: 0.02em;
}
.hero-subtitle {
  margin-top: 6vh;
  font-size: 2vw;
  font-weight: 700;
  line-height: 1.4;
  opacity: 0.95;
}
.subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}
.enter-btn {
  display: block;
  width: 120px;
  height: 40px;
  margin: 16px auto 0;
  background: #165DFF;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 100ms ease, background 100ms ease;
}
.enter-btn:hover {
  background: #3b7aff;
  transform: scale(1.05);
}
.enter-btn:active {
  transform: scale(0.95);
}
.square-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 防止正方形溢出可视区域 */
  position: relative; /* 作为正方形的定位父容器 */
  background-color: #4080ff;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 正方形通用样式 */
.square {
  margin: 0;
  padding: 0;
  width: 75vh;
  height: 75vh;
  /* 圆角：用 vw 确保随视口比例变化 */
  border-radius: 4vh;
  position: absolute;
  top: 50%;
  left: 75%; /* 向右偏移到75%位置 */
  transform-origin: center;
}

.square-white {
  background-color: #ffffff;
  transform: translate(-50%, -50%) rotate(-35deg);
  z-index: 3; /* 最上层 */
}

.square-light-blue {
  background-color: #ddf2ff;
  transform: translate(-50%, -50%) rotate(-10deg);
  z-index: 2; /* 中间层 */
}

.square-deep-blue {
  background-color: #81a6ff;
  transform: translate(-50%, -50%) rotate(15deg);
  z-index: 1; /* 最下层 */
}

.login-form-container {
  position: absolute;
  top: 52%;
  left: 75%; /* 与正方形相同的75%位置 */
  transform: translate(-50%, -50%);
  z-index: 10; /* 确保在正方形之上 */
  min-width: 20vw;
  max-width: 24vw;
}

/* 登录表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

/* Logo容器 */
.logo-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1vh;
  padding-right: 0;
}

/* Logo文字样式 */
.logo-text {
  font-family: "华文中宋 Bold", "华文中宋", sans-serif;
  font-weight: 700;
  color: #6174df;
  text-align: center;
  line-height: 1;
  font-size: 2.8vw; /* 稍微调大，与Logo协调 */
  white-space: nowrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 2.5vw; /* 增加汉字和输入框之间的距离 */
}

.form-label {
  font-size: 1.2vw;
  color: #333;
  font-weight: 500;
  font-family: sans-serif;
  width: 4vw; /* 稍微增加标签宽度，确保不换行 */
  text-align: right;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 4vh;
  border: 1px solid #E0E0E0;
  border-radius: 0.8vh;
  padding: 0 1.2vw;
  font-size: 1.1vw;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus {
  border-color: #4080ff;
}

/* 验证码组 */
.captcha-group {
  display: grid;
  grid-template-columns: 70% 1fr;
  align-items: center;
  column-gap: 1vw;
  width: 100%;
}

.captcha-input {
  width: 100%;
}

.captcha-img {
  width: 8vh;
  height: 4vh;
  object-fit: contain;
  user-select: none;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1vh 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  cursor: pointer;
}

.checkbox {
  width: 1.2vw;
  height: 1.2vw;
  accent-color: #4080ff;
}

.checkbox-text {
  font-size: 1vw;
  color: #4080ff;
  font-family: sans-serif;
}

.links {
  display: flex;
  gap: 1vw;
}

.link {
  font-size: 1vw;
  color: #666;
  text-decoration: none;
  font-family: sans-serif;
  transition: color 0.2s;
}

.register-link {
  color: #4080ff;
  font-weight: 500;
}

.link:hover {
  color: #4080ff;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 60%;
  height: 7vh;
  background: #1d96d9;
  color: white;
  border: none;
  border-radius: 4vh;
  font-size: 1.8vw;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 1.5vh;
  font-family: sans-serif;
  margin-left: auto;
  margin-right: auto;
  padding: 1vh;
}

.login-btn:hover {
  background: #67bff0;
  transform: translateY(-0.1vh);
}

.login-btn:active {
  transform: translateY(0);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-form-container {
    min-width: 65vw;
    max-width: 75vw;
    top: 60%;
  }
  
  .logo {
    width: 10vh;
    height: 10vh;
  }
  .hero {
    left: 6vw;
    top: 28vh;
  }
  .hero-title {
    font-size: 9vw;
  }
  .hero-subtitle {
    margin-top: 4vh;
    font-size: 4.2vw;
  }
  
  .form-label {
    font-size: 3vw;
    width: 7vw; /* 移动端标签宽度 */
  }
  
  .form-row {
    gap: 4vw; /* 移动端也增加间距 */
  }
  
  .logo-text {
    font-size: 6.5vw; /* 移动端字体也调大 */
  }
  
  .form-input {
    height: 6vh;
    font-size: 3vw;
  }
  .captcha-group {
    grid-template-columns: 60% 1fr; /* 移動端同樣 60% */
    column-gap: 2.5vw;
  }
  
  .captcha-img {
    width: 15vw;
    height: 6vh;
  }
  
  .checkbox-text,
  .link {
    font-size: 2.5vw;
  }
  
  .login-btn {
    height: 7vh;
    font-size: 3.5vw;
  }
}
</style>
