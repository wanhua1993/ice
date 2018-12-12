<template>
  <section class="container">
    <div>
      <logo/>
      <h1 class="title">ice</h1>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  created() {},
  beforeMount() {
    const wx = window.wx
    const url = window.location.href

    this.$store.dispatch('getWechatSignature', url).then(res => {
      console.log(res);
      if (res.data.success) {
        const params = res.data.params
        wx.config({
          debug: true,
          appId: params.appId,
          timestamp: params.timestamp,
          nonceStr: params.noncestr,
          signature: params.signature,
          jsApiList: [
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'onMenuShareTimeline',
            'hideAllNonBaseMenuItem',
            'showMenuItems'
          ]
        })
        wx.ready(() => {
          wx.hideAllNonBaseMenuItem()
          console.log('success')
        })
      }
    })
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
