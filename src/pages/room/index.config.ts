export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '房间详情' })
  : { navigationBarTitleText: '房间详情' }
