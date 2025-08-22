import Footer from "../../components/general/Footer";
import Splash from "../../components/general/Splash";
import ProfileCard from "../../components/user/ProfileCard";
import Button from "../../components/general/Button";
import { Heart, MessageCircleQuestionMark } from "lucide-react";

export default function AboutUs() {
    const Team = [
        {
            id: 1,
            firstName: "Jürgen",
            username: "jurgen",
            organizationRole: "Developer",
            profilePictureUrl: "https://i.imgur.com/uBmS5GU.jpeg",
            publicProfile: true,
            location: "Porto",
            hide: { bio: true }
        },
    ];

    return (
        <>
            <Splash uppertext="About" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg p-4">
                    <h1 className="text-xl font-semibold text-white">About the Platform</h1>
                    <div className="mt-1 opacity-75">
                        <p>Our mission is to turn raw flight data into meaningful insights, stories, and visuals. Whether you're a student pilot logging your first solo, an instructor tracking progress, or simply an aviation enthusiast, Flown Records helps you see your flying journey in a whole different perspective.</p>
                        <p>With smart data import tools, you can upload your flight logs from different sources and instantly transform them into interactive charts, statistics, and summaries.</p>
                        <p>We believe flying isn't just about hours logged, but about the experiences behind them. Flown Records gives you a personal dashboard to revisit those moments, celebrate milestones, and share your progress with others in the aviation community.</p>
                        <p>Take your flight data further. Discover trends, set goals, and keep writing your story in the skies.</p>
                    </div>
                </div>

                <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">
                    <h1 className="text-xl font-semibold text-white">Our Team</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 ">
                        { Team.map((member) => (
                            <ProfileCard data={member} />
                        )) }
                    </div>
                </div>

                <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">
                    <h1 className="text-xl font-semibold text-white">More information</h1>
                    <div className="grid lg:grid-cols-4 mt-2 gap-4">
                        <div className="bg-secondary rounded-lg p-4">
                            <h1 className="font-medium">Open Source Code</h1>
                            <p className="text-sm text-white/50">Explore the code behind Flown Records on our GitHub repository.</p>

                            <Button
                                className="flex w-full mt-2"
                                styleType="small"
                                text={
                                    <div className="flex justify-center items-center">
                                        <svg
                                            className="h-5 w-5 inline-block"
                                            role="img"
                                            viewBox="0 0 24 24"
                                            fill="#fff"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <title>GitHub</title>
                                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                        </svg>
                                        <span className="ml-2">View on GitHub</span>
                                    </div>
                                }
                                to="https://github.com/flownrecords"
                            />
                        </div>
                        <div className="bg-secondary rounded-lg p-4">
                            <h1 className="font-medium">Sponsor this project</h1>
                            <p className="text-sm text-white/50">Your support helps us maintain and improve Flown Records.</p>

                            <Button
                                className="flex w-full mt-2"
                                styleType="small"
                                text={
                                    <div className="flex justify-center items-center">
                                        <Heart className="h-5 w-5 inline-block stroke-second-accent" strokeWidth={2}/>
                                        <span className="ml-2">Sponsor Here</span>
                                    </div>
                                }
                                to="https://github.com/sponsors/jurgenjacobsen"
                            />
                        </div>

                        <div className="bg-secondary rounded-lg p-4">
                            <h1 className="font-medium">FAQ</h1>
                            <p className="text-sm text-white/50">
                                Some common questions about Flown Records are answered here.
                            </p>

                            <Button
                                className="flex w-full mt-2"
                                styleType="small"
                                text={
                                    <div className="flex justify-center items-center">
                                        <MessageCircleQuestionMark className="h-5 w-5 inline-block" strokeWidth={2}/>
                                        <span className="ml-2">Discover</span>
                                    </div>
                                }
                                to="/faq"
                            />
                        </div>
                        
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
