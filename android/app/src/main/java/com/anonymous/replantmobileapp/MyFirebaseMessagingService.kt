package com.anonymous.replantmobileapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // 앱이 포그라운드에 있을 때는 SSE로 처리하므로 여기서는 백그라운드 알림만 처리
        // 백그라운드/종료 상태에서만 이 메서드가 호출됨
        if (remoteMessage.notification != null) {
            sendNotification(
                remoteMessage.notification?.title ?: "",
                remoteMessage.notification?.body ?: ""
            )
        }

        // 데이터 페이로드 처리
        if (remoteMessage.data.isNotEmpty()) {
            // 데이터 처리 로직
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // FCM 토큰 갱신 시 처리
        // React Native로 토큰 전달 필요
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "default_channel"
            val channelName = "Default Channel"
            val channelDescription = "Default notification channel"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(channelId, channelName, importance).apply {
                description = channelDescription
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun sendNotification(title: String, messageBody: String) {
        val channelId = "default_channel"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setColor(ContextCompat.getColor(this, R.color.notification_icon_color))

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}
