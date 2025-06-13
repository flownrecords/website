import Splash from "../../components/general/Splash";

export default function AboutUs() {
    const Team = [
        {
            id: 1,
            name: "Jurgen",
            role: "Founder & Developer",
            image: "https://avatars.githubusercontent.com/u/1006260?v=4"
        },
        {
            id: 2,
            name: "John Doe",
            role: "Designer",
            image: "https://via.placeholder.com/150"
        },
        {
            id: 3,
            name: "Jane Smith",
            role: "Product Manager",
            image: "https://via.placeholder.com/150"
        }
    ];

    return (
        <>
            <Splash/>

            <div className="container mx-auto max-w-5xl">
                <div className="px-6 md:px-10 mx-auto">
                    <h1 className="text-4xl font-bold mt-2">Our Mission</h1>
                    <p className="text-white/75">
                        Flown Records is a platform that aims to provide a comprehensive and
                        user-friendly experience for pilots and aviation enthusiasts. Our
                        mission is to simplify the process of tracking and managing flight
                        records, making it easier for users to access their flight data and
                        share it with others. We strive to create a community-driven platform
                        that fosters collaboration and knowledge sharing among aviation
                        professionals and enthusiasts alike.
                    </p>
                </div>

                <div className="px-6 md:px-10 mx-auto mt-4">
                    <h1 className="text-4xl font-bold mt-2 text-right">Our History</h1>
                    <p className="text-white/75 text-right">
                        Flown Records was founded in 2023 by a group of aviation enthusiasts who
                        recognized the need for a more efficient and user-friendly way to manage
                        flight records. With a passion for aviation and a commitment to
                        innovation, our team set out to create a platform that would
                        revolutionize the way pilots and aviation enthusiasts track their
                        flights. Since then, we have been dedicated to continuously improving
                        our platform and expanding our features to better serve our users.
                    </p>
                </div>

                <div className="px-6 md:px-10 mx-auto mt-4">
                    <h1 className="text-4xl font-bold mt-2">Our Team</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
                        {Team.map(member => (
                            <div
                                key={member.id}
                                className="relative bg-gradient-to-br to-neutral-900 from-neutral-800 rounded-lg p-6 text-white overflow-hidden ring-2 ring-white/50 text-center"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full inline-block"
                                />
                                <h1 className="mt-2">
                                    {member.name}
                                </h1>
                                <p className="text-white/50">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}