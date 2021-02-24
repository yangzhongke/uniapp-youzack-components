<template>
	<view class="imt-audio" >
		<template>
			<view class="top">
				<view class="audio-control-wrapper">
					<image :src="poster" mode="aspectFill" class="cover"></image>					
					<image :src="require('./static/loading.png')" v-if="playState=='loading'" class="play loading"></image>
					<template v-else>
						<image :src="require('./static/playbtn.png')" alt="play" @click="play" class="play" v-if="playState=='pause'"></image>
						<image :src="require('./static/pausebtn.png')" alt="pause" @click="pause" class="play" v-else></image>
					</template>
				</view>
			</view>
			<view class="audio-wrapper">
				<view class="titlebox">
					<view class="title">{{name}}</view>
					<view class="singer">{{singer}}</view>
				</view>
				<view class="slidebox">
					<view>{{formatSeconds(currentTime)}}/{{formatSeconds(duration)}}</view>					
					<view>
						<slot name="extraCtrls">
							<text class="hItem extrButton" @click="$emit('Button1Click')" v-show="isButton1Visible">{{button1Text}}</text>
							<text class="hItem extrButton"  @click="$emit('Button2Click')" v-show="isButton2Visible">{{button2Text}}</text>
							<text class="hItem extrButton"  @click="$emit('Button3Click')" v-show="isButton3Visible">{{button3Text}}</text>									
						</slot>
					</view>
				</view>			
			</view>
			<!--video在ios中不能完全隐藏，否则无法播放-->
			<video id="videoPlayer" :src="src" autoplay="true" :muted="false"
			    style="width: 10rpx;height:10rpx;" @play="playerOnPlay" @pause="playerOnPause"
				@ended="playerOnEnded" @timeupdate="playerOnTimeupdate" 
				@waiting="playerOnWaiting" @error="playerOnError"></video>
			<slider class="audio-slider" block-size="12" :max="duration" :value="currentTime"
			 @change="sliderChange" @changing="sliderChanging"></slider>
		</template>
	</view>
</template>

<script>
	/*
	createInnerAudioContext()是audio组件的内部实现，不能熄屏播放、不能后台播放、不能倍速播放。
	getBackgroundAudioManager() 可以熄屏播放、后台播放，不能倍速播放。缺点是响应速度很慢，无法实现精细、及时的进度控制，而且可能被别的程序占用。
	因此这里只能用video来实现，video能倍速播放，不能熄屏播放、不能后台播放。而且避免了用createInnerAudioContext()实现的跳转到别的页面，还在播放的问题
	因此应用程序可以在需要后台播放的时候（需要用户操作触发），再暂停这个控件的播放，然后自己用getBackgroundAudioManager实现后台播放
	*/
	
	import Vue from 'vue';
	export default {
		props: {
			isButton1Visible: {
				type: Boolean,
				default: false
			},
			button1Text: {
				type: String,
				default: ''
			},
			isButton2Visible: {
				type: Boolean,
				default: false
			},
			button2Text: {
				type: String,
				default: ''
			},
			isButton3Visible: {
				type: Boolean,
				default: false
			},
			button3Text: {
				type: String,
				default: ''
			},
		},		
		data() {
			return {
				src:"",
				poster:"",
				name:"...",
				singer:"...",
				duration:0,
				currentTime:0,
				playState:"pause",//"loading"/"playing"/"pause"
				isSliderChanging:false,
			};
		},
		created:function(){		
			//自定义组件，需要传递第二个参数为this，否则后续的pause等操作不起作用
			this.videoCtx = uni.createVideoContext("videoPlayer",this);
		}
		,
		methods:{
			setSrc:function(value)
			{
				this.src = value;
			},
			setPoster:function(value)
			{
				this.poster = value;
			},
			setName:function(value)
			{
				this.name = value;
			},
			setSinger:function(value)
			{
				this.singer = value;
			},
			playerOnPlay:function(e)
			{
			  this.playState="playing";
			  this.$emit("play");
			},
			playerOnPause:function(e)
			{
				this.playState="pause";
				this.$emit("pause");
			},
			playerOnEnded:function(e)
			{	
				this.playState="pause";
				this.$emit("ended");
			},
			playerOnTimeupdate:function(e)
			{
				this.playState="playing";
				this.duration = e.detail.duration;
				this.currentTime = e.detail.currentTime;
				this.$emit("timeUpdate",e.detail);
			},
			playerOnWaiting:function(e)
			{
				this.playState="loading";
			},
			playerOnError:function(e)
			{
				uni.showToast({
					title:"播放出错"+e
				});	
				this.playState="pause";
				this.$emit("error",e);				
			},
			formatSeconds:function(seconds){
				var result = typeof seconds === "string" ? parseFloat(seconds) : seconds;
				if (isNaN(result))
					return "";
				let h = Math.floor(result / 3600) < 10
					? "0" + Math.floor(result / 3600)
					: Math.floor(result / 3600);
				let m = Math.floor((result / 60) % 60) < 10
					? "0" + Math.floor((result / 60) % 60)
					: Math.floor((result / 60) % 60) + h * 60;
				let s = Math.floor(result % 60) < 10
					? "0" + Math.floor(result % 60)
					: Math.floor(result % 60);
				return `${m}:${s}`;				
			},
			stop:function()
			{
				this.videoCtx.stop();
			}
			,
			seek:function(t){
				this.videoCtx.seek(t);
			},
			play:function(){
				var that = this;
				this.videoCtx.play();//在有的H5浏览器里，如果play不是用户触发的，则play()会报错

			},
			pause:function(){
				this.videoCtx.pause();
			},
			playbackRate:function(value){
				this.videoCtx.playbackRate(value);
				//playbackRate不能在play之前或者之后立即调用，否则只有很少几率会成功
			},
			sliderChange:function(e){
				this.isSliderChanging = false;
				//要通过e.detail.value获取，否则如果通过dom去读取slider的value
				//就会存在滚动条拖不动的情况
				this.videoCtx.seek(e.detail.value);
			},
			sliderChanging:function()
			{
				this.isSliderChanging = true;
			},	
		},
	}
</script>

<style lang="scss">
@import './index.scss';    
</style>
