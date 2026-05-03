export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '房间已满' })
  : { navigationBarTitleText: '房间已满' }
