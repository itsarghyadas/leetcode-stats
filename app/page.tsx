/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  GlobeIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";

import AnimatedCircularProgressBarRate from "@/components/animated-progress-bar-rate";
import GradientProgressBar from "@/components/gradient-progress-bar";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// Define interfaces for the user data
interface UserData {
  userAvatar: string;
  realName: string;
  username: string;
  ranking: number;
  reputation: number;
  countryName: string;
  countryFlag: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  languageStats: Language[];
  solvedProblems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  totalAcceptedSubmissions: number;
  totalSubmissions: number;
  availableQuestions: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  totalAdvancedProblemsSolved: number;
  totalIntermediateProblemsSolved: number;
  totalFundamentalProblemsSolved: number;
}

interface Language {
  languageName: string;
  problemsSolved: number;
}

function LeetcodeProfileContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function fetchUserDetails(username: string): Promise<UserData> {
    try {
      const response = await fetch("/api/userdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data: UserData = await response.json();
      if (data.countryName) {
        const countryResponse = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(
            data.countryName
          )}`
        );
        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          data.countryFlag = countryData[0]?.flags?.svg || null;
        }
      }
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }

  useEffect(() => {
    const urlUsername = searchParams.get("username");
    if (urlUsername) {
      setUsername(urlUsername);
      handleSearch(urlUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (searchUsername?: string) => {
    const usernameToSearch = searchUsername || username;
    if (!usernameToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setLoadingTime(0);
    try {
      const data = await fetchUserDetails(usernameToSearch);
      setUserData(data);
      router.push(`?username=${encodeURIComponent(usernameToSearch)}`, {
        scroll: false,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const acceptanceRate = userData
    ? Number(
        (
          (userData.totalAcceptedSubmissions / userData.totalSubmissions) *
          100
        ).toFixed(2)
      )
    : 0;

  return (
    <div className="container mx-auto p-6 text-white min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-5xl mx-auto mb-6 flex flex-col items-center gap-y-5">
        <h2
          onClick={() => {
            router.push("/");
            setUsername("");
            setUserData(null);
            setError(null);
          }}
          className="text-3xl text-center text-balance sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-amber-400 tracking-tighter cursor-pointer hover:text-amber-300 transition-colors"
        >
          LeetCode Profile Stats
        </h2>
        <div className="flex flex-col md:flex-row gap-y-4 md:gap-y-0 items-center gap-x-4 w-full">
          <Input
            type="text"
            placeholder="Enter LeetCode username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleKeyPress}
            className="bg-zinc-800 text-white border-zinc-700 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-offset-zinc-900 focus-visible:ring-amber-500"
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-amber-500 text-white hover:bg-amber-600 w-full md:w-fit"
          >
            Search
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-center text-balance text-sm sm:text-base ">
          Creating stats for {username} in
          <span className="inline-block text-amber-400 ml-2">
            {loadingTime} seconds
          </span>
        </div>
      ) : error ? (
        <div className="text-white flex justify-center items-center">
          Error: {error}
        </div>
      ) : !userData ? (
        <div className="text-white/50 text-center text-balance text-sm sm:text-base">
          Enter a LeetCode username
        </div>
      ) : (
        <Card className="w-full max-w-5xl mx-auto bg-zinc-900 border border-zinc-800">
          <CardHeader className="pb-4 border-b border-zinc-800">
            <div className="flex gap-y-10 md:gap-y-0 justify-between items-start w-full">
              <div className="flex flex-col md:flex-row items-start gap-y-5 md:gap-y-0 gap-x-4">
                <img
                  alt="Profile picture"
                  className="w-16 h-16 rounded-md object-cover ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-900"
                  src={userData.userAvatar}
                />
                <div className="flex flex-col">
                  <CardTitle className="text-xl md:text-2xl font-bold text-white">
                    {userData.realName}
                  </CardTitle>
                  <a
                    href={`https://leetcode.com/${userData.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base text-amber-300/70 cursor-pointer mt-0.5 flex items-center gap-x-1 hover:underline underline-offset-4"
                  >
                    {userData.username}
                    <ExternalLinkIcon className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <AnimatedCircularProgressBarRate
                  acceptanceRate={acceptanceRate}
                />
                <p className="text-xs text-center mt-1 text-zinc-400">
                  Acceptance Rate
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-700/20 rounded-lg h-full">
                <CardContent className="p-0 grid grid-rows-1 h-full">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-zinc-300 mb-4">
                      Solved Problems
                    </h3>
                    <div className="text-4xl font-bold mb-2 text-amber-400">
                      {userData.solvedProblems.total}
                    </div>
                    <GradientProgressBar
                      value={
                        (userData.solvedProblems.total /
                          userData.availableQuestions.total) *
                        100
                      }
                      gradientFrom="#FFD700"
                      gradientTo="#FFA500"
                      className="h-2"
                    />
                    <div className="text-xs text-zinc-400 mt-2 mb-4">
                      {(
                        (userData.solvedProblems.total /
                          userData.availableQuestions.total) *
                        100
                      ).toFixed(1)}
                      % of {userData.availableQuestions.total}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-700/20 p-4 py-0">
                    <div className="grid grid-cols-3 divide-x divide-zinc-700/40">
                      <div className="px-2 first:pl-0 last:pr-0 p-4">
                        <h4 className="text-xs font-medium text-zinc-400 mb-1">
                          Easy
                        </h4>
                        <div className="text-xl font-semibold text-amber-400">
                          {userData.solvedProblems.easy}
                        </div>
                        <GradientProgressBar
                          value={
                            (userData.solvedProblems.easy /
                              userData.availableQuestions.easy) *
                            100
                          }
                          gradientFrom="#FFD700"
                          gradientTo="#DAA520"
                          className="mt-1 h-1"
                        />
                      </div>
                      <div className="px-2 first:pl-0 last:pr-0 p-4">
                        <h4 className="text-xs font-medium text-zinc-400 mb-1">
                          Medium
                        </h4>
                        <div className="text-xl font-semibold text-amber-500">
                          {userData.solvedProblems.medium}
                        </div>
                        <GradientProgressBar
                          value={
                            (userData.solvedProblems.medium /
                              userData.availableQuestions.medium) *
                            100
                          }
                          gradientFrom="#FFA500"
                          gradientTo="#FF8C00"
                          className="mt-1 h-1"
                        />
                      </div>
                      <div className="px-2 first:pl-0 last:pr-0 p-4">
                        <h4 className="text-xs font-medium text-zinc-400 mb-1">
                          Hard
                        </h4>
                        <div className="text-xl font-semibold text-amber-600">
                          {userData.solvedProblems.hard}
                        </div>
                        <GradientProgressBar
                          value={
                            (userData.solvedProblems.hard /
                              userData.availableQuestions.hard) *
                            100
                          }
                          gradientFrom="#FF8C00"
                          gradientTo="#FF4500"
                          className="mt-1 h-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-700/20">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium text-zinc-300 mb-4">
                    Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Acceptance Rate</span>
                      <span className="font-semibold text-amber-400">
                        {acceptanceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ranking</span>
                      <span className="font-semibold text-white">
                        {userData.ranking}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Reputation</span>
                      <span className="font-semibold text-white">
                        {userData.reputation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Country</span>
                      <div className="flex items-center">
                        {userData.countryFlag ? (
                          <img
                            src={userData.countryFlag}
                            alt={userData.countryName}
                            className="w-6 h-4 mr-2"
                          />
                        ) : null}
                        <span className="font-semibold text-white">
                          {userData.countryName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">
                      Proficiency
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Advanced</span>
                          <span>{userData.totalAdvancedProblemsSolved}</span>
                        </div>
                        <GradientProgressBar
                          value={
                            userData.totalAdvancedProblemsSolved +
                              userData.totalIntermediateProblemsSolved +
                              userData.totalFundamentalProblemsSolved ===
                            0
                              ? 0
                              : (userData.totalAdvancedProblemsSolved /
                                  (userData.totalAdvancedProblemsSolved +
                                    userData.totalIntermediateProblemsSolved +
                                    userData.totalFundamentalProblemsSolved)) *
                                100
                          }
                          gradientFrom="#FFD700"
                          gradientTo="#DAA520"
                          className="h-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Intermediate</span>
                          <span>
                            {userData.totalIntermediateProblemsSolved}
                          </span>
                        </div>
                        <GradientProgressBar
                          value={
                            userData.totalAdvancedProblemsSolved +
                              userData.totalIntermediateProblemsSolved +
                              userData.totalFundamentalProblemsSolved ===
                            0
                              ? 0
                              : (userData.totalIntermediateProblemsSolved /
                                  (userData.totalAdvancedProblemsSolved +
                                    userData.totalIntermediateProblemsSolved +
                                    userData.totalFundamentalProblemsSolved)) *
                                100
                          }
                          gradientFrom="#FFA500"
                          gradientTo="#FF8C00"
                          className="h-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Fundamental</span>
                          <span>{userData.totalFundamentalProblemsSolved}</span>
                        </div>
                        <GradientProgressBar
                          value={
                            userData.totalAdvancedProblemsSolved +
                              userData.totalIntermediateProblemsSolved +
                              userData.totalFundamentalProblemsSolved ===
                            0
                              ? 0
                              : (userData.totalFundamentalProblemsSolved /
                                  (userData.totalAdvancedProblemsSolved +
                                    userData.totalIntermediateProblemsSolved +
                                    userData.totalFundamentalProblemsSolved)) *
                                100
                          }
                          gradientFrom="#FF8C00"
                          gradientTo="#FF4500"
                          className="h-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              {userData.languageStats && userData.languageStats.length > 0 && (
                <CardContent>
                  <h3 className="text-lg font-medium text-zinc-300 mb-4">
                    Languages Solved
                  </h3>
                  <div className="flex flex-wrap">
                    {userData.languageStats.map((lang) => (
                      <Card
                        key={lang.languageName}
                        className="bg-zinc-900 border-zinc-700/20 flex-grow rounded-none"
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <span className="text-zinc-300">
                            {lang.languageName}
                          </span>
                          <span className="font-semibold text-white">
                            {lang.problemsSolved}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </div>
          </CardContent>
          <div className="flex justify-center space-x-4 py-6 border-t border-zinc-800">
            <a
              href={userData.githubUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={!userData.githubUrl ? "pointer-events-none" : ""}
            >
              <GitHubLogoIcon
                className={`w-6 h-6 transition-colors ${
                  userData.githubUrl
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
              />
            </a>
            <a
              href={userData.linkedinUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={!userData.linkedinUrl ? "pointer-events-none" : ""}
            >
              <LinkedInLogoIcon
                className={`w-6 h-6 transition-colors ${
                  userData.linkedinUrl
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
              />
            </a>
            <a
              href={userData.twitterUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={!userData.twitterUrl ? "pointer-events-none" : ""}
            >
              <GlobeIcon
                className={`w-6 h-6 transition-colors ${
                  userData.twitterUrl
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
              />
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function LeetcodeProfile() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center justify-center">
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-amber-500 border-b-transparent border-r-transparent border-l-transparent rounded-full"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <LeetcodeProfileContent />
    </Suspense>
  );
}
