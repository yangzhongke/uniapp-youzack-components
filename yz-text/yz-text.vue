<template>
	<view>
		<view @longpress="textLongTap">{{text}}</view>
		<uni-popup ref="popup" type="bottom" :animation="false">
			<scroll-view scroll-y="true" show-scrollbar="true"
			style="background-color:#EEEEEE;border-radius: 10px;height: 60vh;padding: 10px;margin-bottom: 10px;width:95vw">
				<view>
					<view style="display:flex;flex-direction: row;width: 90vw;">
						<button :type="selectedText.length>0?'primary':'default'" @click="search">{{button1Text}}</button>
						<button :type="selectedText.length>0?'primary':'default'" @click="copy">复制</button>
						<button @click="selectAll">全选</button>
						<text @click="close" style="margin-left:auto;font-size:x-large;">X</text>
					</view>
					<view style="height: 20rpx;"></view>
					<view >{{tips}}</view>
					<view style="height: 20rpx;"></view>
					<view style="display: inline;">
						<view size="mini" v-for="s in segments" :class="s.selected?'selected buttonLike':'notselected buttonLike'" 
						@click="segmentClick(s)">{{s.value}}</view>
					</view>
				</view>
			</scroll-view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		props:
		{
			text: {
				type: String,
				default: '',
			},
			tips:{
				type:String,
				default:'选择文本(可多选)后，可以点击【翻译】',
			},
			button1Text:
			{
				type:String,
				default:'翻译',
			}
		},
		data() {
			return {
				segments:[],	
			};
		},
		computed:
		{
			selectedWords:function(){
				let items = this.segments.filter(s=>s.selected).map(s=>s.value);
				return items;
			},
			selectedText:function(){
				let items = this.selectedWords;
				return items.join(" ");
			}
		}
		,
		methods:{
			splitWords:function(s)
			{
				var e = {value:s};
				this.$emit("split",e);
				//如果split事件中为e.words赋值了，则用e.words为分词后的结果
				if(e.words)
				{
					return e.words;
				}
				let words=[],word="";
				let separators = [' ','\t','\r','\n',',','.','!','?',':','[',']','(',')',';','{','}','&','"'];
				for(let i=0;i<s.length;i++)
				{
					let ch = s[i];
					//遇到标点符号，则把之前累积的word当成一个单词，并且把这个标点当成一个单词
					if(separators.indexOf(ch)>=0)
					{
						if(word)
						{
							words.push(word);
							word="";
						}						
						words.push(""+ch);
					}
					else
					{
						word+=ch;
					}
				}
				if(word)//加入最后一个单词
				{
					words.push(word);
				}	
				return words;
			}
			,
			textLongTap:function(){				
				this.segments = this.splitWords(this.text).map(s=>{return {value:s,selected:false}});
				this.$refs.popup.open();
			},
			segmentClick:function(s){
				s.selected=!s.selected;
			},
			close:function()
			{
				this.$refs.popup.close();
			},
			search:function()
			{
				let text = this.selectedText;
				if(text.length<=0)
				{
					uni.showToast({
						title:"没有选择内容"
					});
					return;
				}
				this.$emit("search",text);
				this.close();
			},
			copy:function()
			{
				let text = this.selectedText;
				if(text.length<=0)
				{
					uni.showToast({
						title:"没有选择内容"
					});
					return;
				}
				uni.setClipboardData({
					data:text
				});
				this.close();
			},
			selectAll:function()
			{
				this.segments.forEach(s=>s.selected=true);
			}
		},
	}
</script>

<style lang="scss">
	.buttonLike
	{
		float: left;
		margin:3rpx;
		display: block;
		padding-left: 5px;
		padding-right: 5px;
		box-sizing: border-box;
		font-size: 18px;
		text-align: center;
		text-decoration: none;
		border-radius: 2px;
		-webkit-tap-highlight-color: transparent;
		overflow: hidden;
		cursor: pointer;
		color: #000;
	}
	.selected
	{
		background-color:lightblue;
	}
	.notselected{
		background-color: #f8f8f8;
	}
</style>
