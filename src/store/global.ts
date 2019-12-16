import { observable } from 'mobx'

const globalStore = observable({
  token: '',
  accessToken: '',
  userToken: '',
  otherInviteCode : '',
  otherPhone : '',
  inviteCode : '',
  userInfo: {
    userName : '',
    userPicUrl : ''
  },
  uuid: '',
  saveMyInviteCode(code){
    this.inviteCode = code;
  },
  saveOtherInviteCode(code,phone){
    this.otherInviteCode = code;
    this.otherPhone = phone
  },
  saveUserInfo(data: any) {
   this.userInfo = data
  },
  saveToken(data: any) {
    this.token = data
  },
  saveUserToken(aToken: any, uToken: any) {
    this.accessToken = aToken;
    this.userToken = uToken;
  },
  saveUUID(data:any){
    this.uuid = data
  }
})
export default globalStore