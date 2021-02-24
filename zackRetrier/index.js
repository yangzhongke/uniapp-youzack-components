"use strict";

//https://www.cnblogs.com/cckui/p/10410788.html
const sleep = (timeountMS) => new Promise((resolve) => {
  setTimeout(resolve, timeountMS);
});

async function doRequest(options)
{
	let url = options.url;
	//最大重试次数
	let retryTimes = options.retryTimes;
	if(!retryTimes)
	{
		retryTimes = 3;
	}
	//重试之前等待的毫秒数
	let retryWaitTime = options.retryWaitTime;
	if(!retryWaitTime)
	{
		retryWaitTime = 200;
	}	
	
	//是否自动显示加载动画
	let autoLoading = options.autoLoading;
	if(typeof(autoLoading)=="undefined")
	{
		autoLoading = true;
	}	
	
	if(autoLoading)
	{
		uni.showLoading();
	}	
	let err,resp;
	for(let i=0;i<retryTimes;i++)
	{
		//如果没有传入success/fail/complete 参数，uni.request会返回Promise对象
		[err,resp] = await uni.request(options);
		if(!err)//如果成功则返回
		{
			if(autoLoading)
			{
				uni.hideLoading();
			}			
			return [null,resp];
		}
		await sleep(retryWaitTime);
		console.error("请求"+url+"失败，开始重试第"+(i+1)+"次");
	}
	console.error("重试"+retryTimes+"次都失败了，最终失败");
	if(autoLoading)
	{
		uni.hideLoading();
	}
	return [err,resp];
}

async function zRetrier(options)
{	
	//如果设定manualRetryContent，那么在重试retryTimes次后还失败，
	//则弹出对话框，问用户是否重试，如果用户点击了【重试】，会再次最多重试retryTimes次
	let manualRetryContent = options.manualRetryContent;	
	do
	{
		let err,resp;
		[err,resp] = await doRequest(options);
		if(!err)//请求成功
		{
			return [null,resp];
		}
		//如果请求失败了
		if(!manualRetryContent)//如果没有设定manualRetryContent
		//则不再提示手工重试，直接返回失败
		{
			return [err,resp];
		}
		//如果运行到这里，说明请求失败了，而且设定了manualRetryContent，需要显示手工重试对话框
		let mErr,mRes;
		[mErr,mRes] = await uni.showModal({
			title:"失败",
			confirmText:"重试",
			content:manualRetryContent,
		});
		if(mRes.confirm)
		{
			continue;//用户点击了“重试”，所以再进行下一次循环
		}
		else//用户点击了【取消】，不再重试
		{
			return [err,resp];
		}
	}while(true);

	return [err,resp];//如果重试次数用完还没成功，则这里返回最后一次的uni.request返回值
}

export { zRetrier,sleep };