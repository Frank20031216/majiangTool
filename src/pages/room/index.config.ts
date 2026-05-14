export default typeof definePageConfig === 'function'
  ? definePageConfig({ 
      navigationBarTitleText: '房间详情',
      enableShareAppMessage: true 
    })
  : { 
      navigationBarTitleText: '房间详情',
      enableShareAppMessage: true 
    }