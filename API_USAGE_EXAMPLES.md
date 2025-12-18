# API 사용 예시

이 문서는 Replant 프론트엔드에서 백엔드 API를 사용하는 실전 예시를 제공합니다.

## 목차
1. [인증 (Authentication)](#인증-authentication)
2. [사용자 관리](#사용자-관리)
3. [펫 관리](#펫-관리)
4. [미션 시스템](#미션-시스템)
5. [커뮤니티](#커뮤니티)
6. [채팅](#채팅)
7. [알림](#알림)

---

## 인증 (Authentication)

### 카카오 OAuth 로그인

```typescript
import { loginWithOAuth } from '../services/authService';
import { KakaoLogin } from '@react-native-seoul/kakao-login'; // 예시

const handleKakaoLogin = async () => {
  try {
    // 1. 카카오 SDK로 로그인
    const result = await KakaoLogin.login();
    const kakaoAccessToken = result.accessToken;

    // 2. 백엔드에 로그인 요청
    const loginResult = await loginWithOAuth('KAKAO', kakaoAccessToken);

    if (loginResult.success && loginResult.data) {
      const { user, isNewUser } = loginResult.data;

      if (isNewUser) {
        // 신규 회원 - 온보딩으로 이동
        navigation.navigate('Onboarding', { user });
      } else {
        // 기존 회원 - 메인으로 이동
        navigation.navigate('MainTabs');
      }
    } else {
      Alert.alert('로그인 실패', loginResult.error);
    }
  } catch (error) {
    console.error('Kakao login error:', error);
    Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
  }
};
```

### 자동 로그인

```typescript
// App.tsx 또는 SplashScreen.tsx
import { initializeAuth, getCurrentUser } from '../services/authService';

useEffect(() => {
  const initAuth = async () => {
    const isLoggedIn = await initializeAuth();

    if (isLoggedIn) {
      const user = await getCurrentUser();
      setUser(user);
      navigation.replace('MainTabs');
    } else {
      navigation.replace('Login');
    }
  };

  // 스플래시 화면 표시 후 인증 확인
  setTimeout(initAuth, 2000);
}, []);
```

### 로그아웃

```typescript
import { logout } from '../services/authService';

const handleLogout = async () => {
  const result = await logout();

  if (result.success) {
    navigation.replace('Login');
  } else {
    Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
  }
};
```

---

## 사용자 관리

### 내 정보 조회 및 표시

```typescript
import { getMyInfo } from '../api/userApi';
import { useState, useEffect } from 'react';

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    const result = await getMyInfo();

    if (result.success && result.data) {
      setUserInfo(result.data);
    } else {
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
    }

    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>닉네임: {userInfo?.nickname}</Text>
      <Text>이메일: {userInfo?.email}</Text>
      <Text>성별: {userInfo?.gender}</Text>
    </View>
  );
};
```

### 프로필 수정

```typescript
import { updateMyInfo } from '../api/userApi';

const handleUpdateProfile = async () => {
  const result = await updateMyInfo({
    nickname: newNickname,
    birthDate: selectedDate,
    gender: selectedGender,
    profileImg: uploadedImageUrl,
  });

  if (result.success && result.data) {
    Alert.alert('성공', '프로필이 업데이트되었습니다.');
    setUserInfo(result.data);
  } else {
    Alert.alert('오류', result.error || '프로필 수정에 실패했습니다.');
  }
};
```

---

## 펫 관리

### 내 펫 조회

```typescript
import { getMyReant } from '../api/petApi';

const PetScreen = () => {
  const [pet, setPet] = useState(null);

  useEffect(() => {
    fetchPet();
  }, []);

  const fetchPet = async () => {
    const result = await getMyReant();

    if (result.success && result.data) {
      setPet(result.data);
    }
  };

  return (
    <View>
      <Text>{pet?.name}</Text>
      <Text>레벨: {pet?.level}</Text>
      <Text>경험치: {pet?.exp} / {pet?.nextLevelExp}</Text>
      <ProgressBar
        progress={pet?.exp / pet?.nextLevelExp}
        color={colors.primary.default}
      />
    </View>
  );
};
```

### 펫 이름 변경

```typescript
import { updateReant } from '../api/petApi';

const handleChangePetName = async (newName: string) => {
  const result = await updateReant({
    name: newName,
  });

  if (result.success && result.data) {
    setPet(result.data);
    Alert.alert('성공', '펫 이름이 변경되었습니다.');
  } else {
    Alert.alert('오류', result.error);
  }
};
```

---

## 미션 시스템

### 오늘의 미션 조회

```typescript
import { getUserMissions } from '../api/missionApi';

const fetchTodayMissions = async () => {
  const result = await getUserMissions({
    status: 'ASSIGNED',
    page: 0,
    size: 10,
  });

  if (result.success && result.data) {
    setMissions(result.data.content);
  }
};
```

### 미션 인증 (GPS)

```typescript
import { verifyUserMission } from '../api/missionApi';
import Geolocation from '@react-native-community/geolocation';

const handleVerifyMission = async (userMissionId: number) => {
  // 1. 현재 위치 가져오기
  Geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      // 2. 미션 인증 요청
      const result = await verifyUserMission(userMissionId, {
        type: 'GPS',
        latitude,
        longitude,
      });

      if (result.success && result.data) {
        const { rewards, recommendation } = result.data;

        Alert.alert(
          '미션 완료!',
          `경험치 +${rewards.expEarned}\n${
            rewards.badge ? '뱃지를 획득했습니다!' : ''
          }`
        );

        // 추천 친구가 있으면 알림
        if (recommendation) {
          Alert.alert(
            '새로운 친구 추천',
            `${recommendation.recommendedUserNickname}님과 연결되었습니다!`
          );
        }

        fetchTodayMissions(); // 목록 새로고침
      } else {
        Alert.alert('인증 실패', result.error);
      }
    },
    (error) => {
      Alert.alert('오류', '위치 정보를 가져올 수 없습니다.');
    }
  );
};
```

### 미션 인증 (TIME)

```typescript
import { verifyUserMission } from '../api/missionApi';

const MissionTimerScreen = ({ userMissionId, requiredMinutes }) => {
  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = () => {
    setStartTime(new Date().toISOString());
    setIsRunning(true);
  };

  const stopAndVerify = async () => {
    const endTime = new Date().toISOString();

    const result = await verifyUserMission(userMissionId, {
      type: 'TIME',
      startedAt: startTime,
      endedAt: endTime,
    });

    if (result.success && result.data) {
      const { timeActualMinutes } = result.data.verification;
      Alert.alert(
        '미션 완료!',
        `${timeActualMinutes}분 동안 수행하셨습니다.`
      );
    } else {
      Alert.alert('인증 실패', result.error);
    }

    setIsRunning(false);
  };

  return (
    <View>
      <Button
        title={isRunning ? '완료' : '시작'}
        onPress={isRunning ? stopAndVerify : startTimer}
      />
    </View>
  );
};
```

### 커스텀 미션 생성

```typescript
import { createCustomMission } from '../api/missionApi';

const handleCreateCustomMission = async () => {
  const result = await createCustomMission({
    title: '매일 독서 30분',
    description: '하루 30분씩 책 읽기',
    durationDays: 14,
    isPublic: true,
    verificationType: 'TIME',
    requiredMinutes: 30,
    expReward: 20,
    badgeDurationDays: 7,
  });

  if (result.success && result.data) {
    Alert.alert('성공', '커스텀 미션이 생성되었습니다!');
    navigation.goBack();
  } else {
    Alert.alert('오류', result.error);
  }
};
```

---

## 커뮤니티

### 게시글 목록 조회

```typescript
import { getPosts } from '../api/communityApi';

const CommunityScreen = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (pageNum: number = 0) => {
    setLoading(true);
    const result = await getPosts({
      page: pageNum,
      size: 20,
    });

    if (result.success && result.data) {
      if (pageNum === 0) {
        setPosts(result.data.content);
      } else {
        setPosts([...posts, ...result.data.content]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={() => fetchPosts(page + 1)}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={() => fetchPosts(0)}
    />
  );
};
```

### 게시글 작성

```typescript
import { createPost } from '../api/communityApi';

const handleCreatePost = async () => {
  const result = await createPost({
    missionId: selectedMissionId, // 선택사항
    title: postTitle,
    content: postContent,
    imageUrls: uploadedImageUrls,
  });

  if (result.success && result.data) {
    Alert.alert('성공', '게시글이 작성되었습니다!');
    navigation.goBack();
  } else {
    Alert.alert('오류', result.error);
  }
};
```

### 댓글 작성

```typescript
import { createComment } from '../api/communityApi';

const handleAddComment = async (postId: number, content: string) => {
  const result = await createComment(postId, { content });

  if (result.success && result.data) {
    // 댓글 목록에 추가
    setComments([...comments, result.data]);
    setCommentText('');
  } else {
    Alert.alert('오류', result.error);
  }
};
```

---

## 채팅

### 채팅방 목록 조회

```typescript
import { getChatRooms } from '../api/chatApi';

const ChatListScreen = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    const result = await getChatRooms();

    if (result.success && result.data) {
      setRooms(result.data.rooms);
    }
  };

  return (
    <FlatList
      data={rooms}
      renderItem={({ item }) => (
        <ChatRoomCard
          room={item}
          onPress={() =>
            navigation.navigate('ChatRoom', { roomId: item.id })
          }
        />
      )}
    />
  );
};
```

### 메시지 전송

```typescript
import { sendMessage, getChatMessages } from '../api/chatApi';

const ChatRoomScreen = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const result = await sendMessage(roomId, {
      content: inputText,
    });

    if (result.success && result.data) {
      setMessages([result.data, ...messages]);
      setInputText('');
    } else {
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
        />
        <Button title="전송" onPress={handleSendMessage} />
      </View>
    </View>
  );
};
```

---

## 알림

### 알림 목록 조회

```typescript
import { getNotifications, markNotificationAsRead } from '../api/notificationApi';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const result = await getNotifications({
      page: 0,
      size: 50,
    });

    if (result.success && result.data) {
      setNotifications(result.data.content);
      setUnreadCount(result.data.unreadCount);
    }
  };

  const handleNotificationPress = async (notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      fetchNotifications();
    }

    // 알림 타입에 따라 화면 이동
    switch (notification.type) {
      case 'MISSION_ASSIGNED':
        navigation.navigate('Missions');
        break;
      case 'USER_RECOMMENDED':
        navigation.navigate('Recommendations');
        break;
      case 'CHAT_MESSAGE':
        navigation.navigate('ChatRoom', {
          roomId: notification.referenceId,
        });
        break;
    }
  };

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationCard
          notification={item}
          onPress={() => handleNotificationPress(item)}
        />
      )}
    />
  );
};
```

---

## 에러 처리 패턴

모든 API 호출에서 일관된 에러 처리:

```typescript
const handleApiCall = async () => {
  try {
    const result = await someApiFunction();

    if (result.success && result.data) {
      // 성공 처리
      console.log('Success:', result.data);
    } else {
      // API 에러 처리
      Alert.alert('오류', result.error || '요청에 실패했습니다.');
    }
  } catch (error) {
    // 예외 처리
    console.error('Unexpected error:', error);
    Alert.alert('오류', '예기치 않은 문제가 발생했습니다.');
  }
};
```

---

## 추가 정보

- 전체 API 명세: `../Replant-be/API_SPEC.md`
- 백엔드 연동 가이드: `./BACKEND_INTEGRATION.md`
- 개발 가이드: `./DEVELOPMENT.md`
