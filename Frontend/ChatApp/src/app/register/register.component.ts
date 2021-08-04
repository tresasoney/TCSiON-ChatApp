import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { UserModel } from '../models/user.model';
import { UserauthService } from '../services/userauth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {


  constructor(private userAuth: UserauthService) { }


  usernamePage = true;
  usernameTaken = false;
  usernameLoginButtonDisabled = true;
  detailsPage = false;
  passwordPage = false;
  emailPage = false;
  emailTaken = false;
  termsBox = false;
  verifyButtonDisable = false;
  otpPage = false;
  otphint = false;
  regSuccess = false;

  hidePassword = true;


  username = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]);
  firstName = new FormControl('', Validators.required);
  lastName = new FormControl('', Validators.required);
  phone = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]);
  bio = new FormControl('bio', Validators.required);
  profilePicture = new FormControl('', Validators.required);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  otp = new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]);

  userNameFixer() {
    let value = this.username.value;
    value = value.toLowerCase();
    value = value.replace(/[^A-Z0-9]+/ig, "_");
    if (value[0] === "_") {
      value = value.substring(1);
    }
    this.username.setValue(value);
    this.duperUsernameCheck()
  }

  duperUsernameCheck() {
    this.usernameLoginButtonDisabled = true;
    this.userAuth.dupeUsernameCheck(this.username.value).subscribe(status => {
      if (status.message == "notfound") {
        this.usernameTaken = false;
        this.usernameLoginButtonDisabled = false;
      }
      else if (status.message == "found") {
        this.usernameTaken = true;
        this.username.setErrors({ 'incorrect': true })
      }
    });
  }

  openNamePage() {
    this.usernameLoginButtonDisabled = true;
    this.userAuth.dupeUsernameCheck(this.username.value).subscribe(status => {
      if (status.message == "notfound") {
        this.usernameTaken = false;
        this.usernameLoginButtonDisabled = false;
        this.usernamePage = false;
        this.detailsPage = true;
      }
      else if (status.message == "found") {
        this.username.setErrors({ 'incorrect': true })
        this.usernameTaken = true;
      }
    });
  }

  selectedImage!: FileList;
  imageSelected(element: any) {
    this.selectedImage = element.target.files;
    var file = this.selectedImage[0];
    var reader = new FileReader();
    reader.onload = this.readerLoaded.bind(this);
    reader.readAsBinaryString(file);
  }

  finalPictureString: string = "";
  readerLoaded(evt: any) {
    var binaryString = evt.target.result;
    this.finalPictureString = `data:${this.selectedImage[0].type};base64,${btoa(binaryString)}`;
  }

  checkEmail() {
    console.log('here')
    this.verifyButtonDisable = true;
    this.userAuth.dupeEmailCheck(this.email.value).subscribe(status => {
      if (status.message == "found") {
        this.email.setErrors({ 'incorrect': true })
        this.emailTaken = true;
        this.verifyButtonDisable = false;
      }
      else {
        this.emailPage = false;
        this.otpPage = true;
        this.sendOTP();
      }
    });
  }

  sendOTP() {
    this.userAuth.initiateMailVerification(this.email.value).subscribe(status => {
      return;
    });
  }

  verifyOTP() {
    this.userAuth.verifyMailOtp(this.email.value, this.otp.value).subscribe(status => {
      if (status.message == "success") {
        let user = new UserModel("", this.firstName.value, this.lastName.value, this.email.value, this.bio.value, "offline", this.phone.value, this.finalPictureString, [], this.username.value, this.password.value, [], [], []);
        this.userAuth.signUpUser(user).subscribe(status => {
          if (status.message == "success") {
            this.otpPage = false;
            this.regSuccess = true;
          }
        })
      }
      else {
        this.otp.setErrors({ 'incorrect': true });
      }
    })
  }

  remainingTime = '';
  timerOn = false;

  timer(remaining: number) {
    let m = Math.floor(remaining / 60).toString();
    console.log(m)
    let s = (remaining % 60).toString();
    m = Number(m) < 10 ? '0' + m : m;
    s = Number(s) < 10 ? '0' + s : s;
    this.remainingTime = m + ':' + s;
    remaining--;

    if (remaining > 0 && this.timerOn) {
      setTimeout(() => {
        this.timer(remaining);
      }, 1000);
      return;
    }

    if (remaining == 0) {
      this.remainingTime = '';
      this.timerOn = false;
    }

    if (!this.timerOn) {
      this.remainingTime = ''
      return;
    }
  }


  ngOnInit(): void {
  }

}
