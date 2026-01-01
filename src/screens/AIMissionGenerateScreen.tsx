/**
 * AI 미션 생성 화면
 * 1주일간 수행한 미션을 분석하여 맞춤형 미션 생성
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Header, Loading, ErrorBoundary, Card, Button, SectionTitle } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
// API 호출하지 않음 - 로컬 전용 앱
import { WeeklyMissionStats, MissionAnalysis, AIGeneratedMission } from '../types';

interface AIMissionGenerateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const AIMissionGenerateScreen: React.FC<AIMissionGenerateScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<WeeklyMissionStats | null>(null);
  const [analysis, setAnalysis] = useState<MissionAnalysis | null>(null);
  const [generatedMission, setGeneratedMission] = useState<AIGeneratedMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 주간 통계 로드
  const loadStats = async () => {
    setLoading(true);
    setError('AI 미션 생성 기능은 준비중입니다.');
    setLoading(false);
  };

  // 미션 분석
  const handleAnalyze = async () => {
    Alert.alert('준비중', 'AI 미션 분석 기능은 준비중입니다.');
  };

  // AI 미션 생성
  const handleGenerateMission = async () => {
    Alert.alert('준비중', 'AI 미션 생성 기능은 준비중입니다.');
  };

  // 생성된 미션을 커스텀 미션 생성 화면으로 전달
  const handleEditMission = () => {
    if (!generatedMission) return;

    navigation.navigate('CustomMissionCreate', {
      generatedMission: generatedMission,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <Loading text="주간 통계를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {/* 주간 통계 */}
        {stats && (
          <Card style={styles.statsCard}>
            <SectionTitle title="주간 미션 통계" marginBottom={spacing[3]} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>완료한 미션</Text>
              <Text style={styles.statValue}>{stats.total_completed}개</Text>
            </View>
            {Object.keys(stats.category_stats).length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>카테고리별</Text>
                <View style={styles.categoryStats}>
                  {Object.entries(stats.category_stats).map(([category, count]) => (
                    <Text key={category} style={styles.categoryStat}>
                      {category}: {count}개
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        {/* 분석 버튼 */}
        <Card style={styles.actionCard}>
          <SectionTitle title="미션 분석" marginBottom={spacing[3]} />
          <Text style={styles.description}>
            지난 1주일간 완료한 미션을 분석하여 나만의 맞춤형 미션을 추천받을 수 있어요.
          </Text>
          <Button
            title={analyzing ? '분석 중...' : '미션 분석하기'}
            onPress={handleAnalyze}
            disabled={analyzing}
            style={styles.button}
          />
        </Card>

        {/* 분석 결과 */}
        {analysis && (
          <Card style={styles.analysisCard}>
            <SectionTitle title="분석 결과" marginBottom={spacing[3]} />
            {analysis.patterns.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisLabel}>패턴</Text>
                {analysis.patterns.map((pattern, index) => (
                  <Text key={index} style={styles.analysisText}>
                    • {pattern}
                  </Text>
                ))}
              </View>
            )}
            {analysis.recommendations.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisLabel}>추천</Text>
                {analysis.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.analysisText}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* AI 미션 생성 버튼 */}
        {analysis && (
          <Card style={styles.actionCard}>
            <Button
              title={generating ? '생성 중...' : 'AI 미션 생성하기'}
              onPress={handleGenerateMission}
              disabled={generating || !analysis}
              style={styles.button}
            />
          </Card>
        )}

        {/* 생성된 미션 미리보기 */}
        {generatedMission && (
          <Card style={styles.missionCard}>
            <SectionTitle title="생성된 미션" marginBottom={spacing[3]} />
            <View style={styles.missionPreview}>
              <Text style={styles.missionEmoji}>{generatedMission.emoji}</Text>
              <Text style={styles.missionTitle}>{generatedMission.title}</Text>
              <Text style={styles.missionDescription}>{generatedMission.description}</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionInfoText}>
                  난이도: {generatedMission.difficulty === 'easy' ? '쉬움' : generatedMission.difficulty === 'medium' ? '보통' : '어려움'}
                </Text>
                <Text style={styles.missionInfoText}>
                  경험치: +{generatedMission.experience} EXP
                </Text>
              </View>
              {generatedMission.reasoning && (
                <View style={styles.reasoningContainer}>
                  <Text style={styles.reasoningLabel}>추천 이유</Text>
                  <Text style={styles.reasoningText}>{generatedMission.reasoning}</Text>
                </View>
              )}
            </View>
            <View style={styles.missionActions}>
              <Button
                title="수정하기"
                onPress={handleEditMission}
                variant="outline"
                style={styles.editButton}
              />
              <Button
                title="저장하기"
                onPress={() => {
                  Alert.alert('알림', '미션 저장 기능은 커스텀 미션 생성 화면에서 완료해주세요.');
                  handleEditMission();
                }}
                style={styles.saveButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  statsCard: {
    marginBottom: spacing[4],
  },
  statItem: {
    marginBottom: spacing[3],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  categoryStats: {
    marginTop: spacing[1],
  },
  categoryStat: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  actionCard: {
    marginBottom: spacing[4],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  button: {
    marginTop: spacing[2],
  },
  analysisCard: {
    marginBottom: spacing[4],
  },
  analysisSection: {
    marginBottom: spacing[4],
  },
  analysisLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  analysisText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing[1],
  },
  missionCard: {
    marginBottom: spacing[4],
  },
  missionPreview: {
    marginBottom: spacing[4],
  },
  missionEmoji: {
    fontSize: typography.fontSize['4xl'],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  missionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  missionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing[3],
  },
  missionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  missionInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  reasoningContainer: {
    marginTop: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
  },
  reasoningLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
    marginBottom: spacing[1],
  },
  reasoningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  missionActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  editButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default AIMissionGenerateScreen;
