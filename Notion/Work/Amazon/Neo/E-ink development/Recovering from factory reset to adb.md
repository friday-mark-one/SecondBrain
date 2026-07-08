---

---


**Aravind Bharathi Sumathy Rajeswaran**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666738939041289)

[@haohu](https://amzn-wwc.slack.com/team/W017M3VM4LT) I am unable to downgrade from GM enabled J16.1 #49 to a non GM enabled build to be able to install artifacts for KER-J16.1 validations. [@tingli](https://amzn-wwc.slack.com/team/W0175T12VMM) is helping with today's validation but we might miss the 4:30PM cut-off. Updating here in-case we might need a manual build triggered.

32 replies

---

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666739289565179?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Which error do you get during downgrade?

**Aravind Bharathi Sumathy Rajeswaran**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666739361446009?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

On placing build #1523 or #48 I get an error popup saying the build file is invalid. Restarting the device in this state does nothing and build #49 is still maintained.Tried the following, but no luck. Still go to storage mode.

1. einkbear and adb is not recognized.
2. tried touch ENABLE_USBNET on Kindle folder, restart and ;un

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666739483050409?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Is device at least detected in usbnet mode?

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666739512333599?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Oh, no. Just storage mode I read it

:yes:2😢2

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666739717369529?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

I wonder why usbnet doesn’t work

**Lingjie Zhang**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666740191828319?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Get the same issue. I used `;un`  to enable the usbnet. Then touch the GMC flag file. After restart i can install a new full bin file. But the installation failed with error 12 (edited)

**Joe Luke**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666745744533689?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@haohu](https://amzn-wwc.slack.com/team/W017M3VM4LT) I got this same issue when trying what you suggested downgrading from build 49.

**Aravind Bharathi Sumathy Rajeswaran**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666750206375599?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@ljz](https://amzn-wwc.slack.com/team/W0176KXT2GP) steps worked for me after connected to USB network.

3. Used [https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/](https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/) to connect to USB net.
4. Log into the device using ssh root@192.168.15.244
5. touch /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC; in /mnt/us
6. restart the device.
7. Push mainline build #1523 and restart the device.

**Hao Hu**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666751593398289?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Thanks folks for sharing the steps here to help unblock each other.

**Lingjie Zhang**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666753829193419?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Fixed one device with similar einkbear. The key part is using usb network mode and keeping the cable connected during install a build.  However, the other device still can not change to usb network mode. Will load a new release build tomorrow

**Joe Luke**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666800856818979?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

I’m running into a slightly different issue - USB net seems to be working correctly, but ssh does not (I’ve followed the steps linked above [here](https://w.amazon.com/index.php/KindleQA/USBNet#Macs)). (Trying to downgrade J16.1 build 49 to something else so I can install other builds again.) (edited)

**Aravind Bharathi Sumathy Rajeswaran**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666809039317679?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Ssh worked for me only after i disconnected wifi. Maybe this might help.

**Joe Luke**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666809559824039?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

I disabled wifi both on device (via airplane mode) and on my mac.

**Alex Xu**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666810568744179?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Maybe worth to try to manually install testutils.bin , then try to enable usb or adb mode again.[https://download.kbits.build.lab126.a2z.com/build_files/download/juno_1601_barolo_bellatrix3/O[…]ed/update-J1601-bellatrix3_barolo-050-testutils.bin](https://download.kbits.build.lab126.a2z.com/build_files/download/juno_1601_barolo_bellatrix3/OFFICIAL/050/non-obfuscated/update-J1601-bellatrix3_barolo-050-testutils.bin)

**Alex Xu**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666810592552989?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Then this is a method shared by Gopi:**Gopinath Venkataraman**  [5:20 AM]go to /etc/version and upgrade your number to indefinite one.. and then flash any builds , it will get updated

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666811811062279?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@joseluke](https://amzn-wwc.slack.com/team/W017LFWFKKM) I have seen usbnet issues when connected to corporate VPN from office or via Cisco VPN. Disconnecting will work, but you will need to manually push the build to device (Torch won’t work out of VPN). (edited)

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666811873059049?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@xzhe](https://amzn-wwc.slack.com/team/W017ZGQL8HF) Torch does the /etc/version.txt automatically

**Joe Luke**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666811897376059?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Nope, in office and not on VPN. I’ll try restarting computer + device in a bit.

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666812676311469?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

That’s weird then, are you sure you weren’t not connected to wpa2 network or via ethernet?

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666823323189599?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

8. Used [https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/](https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/) to connect to USB net.
9. Log into the device using ssh root@192.168.15.244
10. touch /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC; in /mnt/us
11. restart the device.
12. Push mainline build #1523 and restart the device.

After step 4, the device still get into usb drive mode…Just to double check, should I do `touch PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC` in step 3? Or I may have mess up the file name.And i uploaded J16.1-48 to it, the device still says it’s an invalid buildCC: [@sathveek](https://amzn-wwc.slack.com/team/W017T627VC4) [@yaaseena](https://amzn-wwc.slack.com/team/W017DFPN7V4) [@justwood](https://amzn-wwc.slack.com/team/W017SNFUG4C) (edited)

**Yaaseen Atchia**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666823646262089?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

What I did was run `mntroot rw;`then touch `touch /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC;`  then einkbear push update to `mnt/us` . Then do a restart. That put me back to mainline 1523. (edited)

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666823810138179?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

That means touch at the root level, right? I see it complains: Read-only file system. And sudo doesn’t exist there 🥲 (edited)

**Aravind Bharathi Sumathy Rajeswaran**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666824000045599?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

mntroot will make the file system read/write.

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666824038950729?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Oh yeah, I forgot about that

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666824746324049?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@yaaseena](https://amzn-wwc.slack.com/team/W017DFPN7V4) could you elaborate on “einkbear push update to /mmt/us/“ like a wiki, etc?

**Yaaseen Atchia**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666824828391289?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

I just meant I ran `einkbear push update-SBR-bellatrix3_barolo-1524.bin /mnt/us`

:thank-you:1

**Joe Luke**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666825322197939?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

> That’s weird then, are you sure you weren’t not connected to wpa2 network or via ethernet?

You’re right [@kellerms](https://amzn-wwc.slack.com/team/W018ADLQ132); I was stupid and only tried with one or the other off before. After fully disconnecting ssh worked, and I’m able to downgrade using the same steps [@yaaseena](https://amzn-wwc.slack.com/team/W017DFPN7V4) mentioned.

Pinned by

**Saravanan Chellamuthu**

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666825597264399?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Yeah I finally figured the following steps:

13. Used [https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/](https://w.amazon.com/bin/view/HOWTO_configure_USB_networking_on_Mac_OS_X/) to connect to USB net.
14. Log into the device using ssh root@192.168.15.244
15. run `mntroot rw;` to get root permission
16. `touch /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC` in ~~/mnt/us~~ root
17. ~~restart the device.~~
18. Push a working build `einkbear push update-SBR-bellatrix3_barolo-1524.bin /mnt/us` to /mnt/us
19. restart the device.

CC: [@sathveek](https://amzn-wwc.slack.com/team/W017T627VC4) (edited)

:ty-thankyou:3👍3

**Yaaseen Atchia**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666825747912039?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

You also need to run `mntroot rw;`

**Ethan Hou**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666826224097559?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

Thanks, updated

**Hao Hu**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666942563713339?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

[@arumugab](https://amzn-wwc.slack.com/team/W01755NPJTH), if the GM flagged build has USBNetwork, it should also offer adb as well. I'm wondering if we should just remove USBNetwork & adb for the OTA bin file and keep them in the non-obfuscated build? (Yes, obfuscation is just for Jar, but we could also leverage that as a differentiator).  In fact, I would actually suggest us to consider any non-obfuscated build should always have both USBNetwork & ADB, that will make all the developer's life much easier while NOT introducing any difference on the customer bin.  Any suggestion here?

:plus1:2

**Keller Rivero**

[1 year ago](https://amzn-wwc.slack.com/archives/C02BHMQUUUS/p1666943991122119?thread_ts=1666738939.041289&cid=C02BHMQUUUS)

+1 on [@haohu](https://amzn-wwc.slack.com/team/W017M3VM4LT)
