---

---
### Linux setup

Nodejs - [https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)

JDK - [https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/amazon-linux-install.html](https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/amazon-linux-install.html)

python - python3 preinstalled

pip - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install-linux.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install-linux.html)

Appium - [https://appium.io/docs/en/2.1/quickstart/install/](https://appium.io/docs/en/2.1/quickstart/install/)

`sudo yum install git`

Android setup - [https://appium.io/docs/en/2.1/quickstart/uiauto2-driver/](https://appium.io/docs/en/2.1/quickstart/uiauto2-driver/)

1. download cmdline-tools - [https://developer.android.com/tools](https://developer.android.com/tools)
2. set ANDROID_HOME, JAVA_HOME and PATH correctly
3. [https://medium.com/heuristics/deploying-android-emulators-on-aws-ec2-1-3-arm-architecture-and-genymotion-solutions-for-a-2ef3238542d5](https://medium.com/heuristics/deploying-android-emulators-on-aws-ec2-1-3-arm-architecture-and-genymotion-solutions-for-a-2ef3238542d5)

OpenGL error - [https://stackoverflow.com/a/70672240/3505471](https://stackoverflow.com/a/70672240/3505471)

Attach volume - [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-attaching-volume.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-attaching-volume.html)

Use volume - [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html)

**Not enough RAM with free tier (2GB) :(**

### Mac setup

```javascript
# see the cron job
crontab -l 

# scripts location
/Applications/Utilities/book-shuttle.sh

# server start application
# automatically starts on login (has been added to login items)
~/Applications/Appium-start.app

# source location
~/workspace/android-automation/book-shuttle
```