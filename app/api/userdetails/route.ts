import { NextResponse } from "next/server";

async function fetchGraphQL(query: string, variables: { username: string }) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

export async function POST(request: Request) {
  const { username } = await request.json();

  try {
    const [
      userProfileData,
      languageStatsData,
      userQuestionSolvedData,
      skillStatsData,
    ] = await Promise.all([
      fetchGraphQL(
        `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            contestBadge {
              name
              expired
              hoverText
              icon
            }
            username
            githubUrl
            twitterUrl
            linkedinUrl
            profile {
              ranking
              userAvatar
              realName
              aboutMe
              school
              websites
              countryName
              company
              jobTitle
              skillTags
              postViewCount
              postViewCountDiff
              reputation
              reputationDiff
              solutionCount
              solutionCountDiff
              categoryDiscussCount
              categoryDiscussCountDiff
            }
          }
        }
      `,
        { username }
      ),
      fetchGraphQL(
        `
        query languageStats($username: String!) {
          matchedUser(username: $username) {
            languageProblemCount {
              languageName
              problemsSolved
            }
          }
        }
      `,
        { username }
      ),
      fetchGraphQL(
        `
        query userSessionProgress($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
      `,
        { username }
      ),
      fetchGraphQL(
        `
        query skillStats($username: String!) {
          matchedUser(username: $username) {
            tagProblemCounts {
              advanced {
                tagName
                tagSlug
                problemsSolved
              }
              intermediate {
                tagName
                tagSlug
                problemsSolved
              }
              fundamental {
                tagName
                tagSlug
                problemsSolved
              }
            }
          }
        }
      `,
        { username }
      ),
    ]);

    const user = userProfileData.data.matchedUser;
    const profile = user.profile;
    const languageStats =
      languageStatsData.data.matchedUser.languageProblemCount;
    const allQuestionsCount = userQuestionSolvedData.data.allQuestionsCount;
    const submitStats = userQuestionSolvedData.data.matchedUser.submitStats;

    const solvedProblems = {
      easy: submitStats.acSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Easy"
      ).count,
      medium: submitStats.acSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Medium"
      ).count,
      hard: submitStats.acSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Hard"
      ).count,
      total: submitStats.acSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "All"
      ).count,
    };

    const attemptedProblems = {
      easy: submitStats.totalSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Easy"
      ).count,
      medium: submitStats.totalSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Medium"
      ).count,
      hard: submitStats.totalSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "Hard"
      ).count,
      total: submitStats.totalSubmissionNum.find(
        (item: { difficulty: string }) => item.difficulty === "All"
      ).count,
    };

    const totalAcceptedSubmissions = submitStats.acSubmissionNum.find(
      (item: { difficulty: string }) => item.difficulty === "All"
    ).submissions;
    const totalSubmissions = submitStats.totalSubmissionNum.find(
      (item: { difficulty: string }) => item.difficulty === "All"
    ).submissions;

    const availableQuestions = {
      easy: allQuestionsCount.find(
        (item: { difficulty: string }) => item.difficulty === "Easy"
      ).count,
      medium: allQuestionsCount.find(
        (item: { difficulty: string }) => item.difficulty === "Medium"
      ).count,
      hard: allQuestionsCount.find(
        (item: { difficulty: string }) => item.difficulty === "Hard"
      ).count,
      total: allQuestionsCount.find(
        (item: { difficulty: string }) => item.difficulty === "All"
      ).count,
    };

    const totalAdvancedProblemsSolved =
      skillStatsData.data.matchedUser.tagProblemCounts.advanced.reduce(
        (total: number, tag: { problemsSolved: number }) =>
          total + tag.problemsSolved,
        0
      );

    const totalIntermediateProblemsSolved =
      skillStatsData.data.matchedUser.tagProblemCounts.intermediate.reduce(
        (total: number, tag: { problemsSolved: number }) =>
          total + tag.problemsSolved,
        0
      );

    const totalFundamentalProblemsSolved =
      skillStatsData.data.matchedUser.tagProblemCounts.fundamental.reduce(
        (total: number, tag: { problemsSolved: number }) =>
          total + tag.problemsSolved,
        0
      );

    const extractedData = {
      username: user.username,
      realName: profile.realName,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      linkedinUrl: user.linkedinUrl,
      reputation: profile.reputation,
      countryName: profile.countryName,
      ranking: profile.ranking,
      userAvatar: profile.userAvatar,
      languageStats: languageStats,
      solvedProblems: solvedProblems,
      attemptedProblems: attemptedProblems,
      availableQuestions: availableQuestions,
      totalAcceptedSubmissions: totalAcceptedSubmissions,
      totalSubmissions: totalSubmissions,
      totalAdvancedProblemsSolved: totalAdvancedProblemsSolved,
      totalIntermediateProblemsSolved: totalIntermediateProblemsSolved,
      totalFundamentalProblemsSolved: totalFundamentalProblemsSolved,
    };

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
