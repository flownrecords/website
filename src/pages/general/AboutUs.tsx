import Footer from "../../components/general/Footer";
import Splash from "../../components/general/Splash";

export default function AboutUs() {
    const Team = [
        {
            id: 1,
            name: "Jürgen",
            role: "Lead Developer",
            image: "https://placehold.co/256x256",
        },
    ];

    return (
        <>
            <Splash uppertext="About" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="">
                        <h1 className="text-4xl font-bold">Our Mission</h1>
                        <p className="text-white/75">Placeholder</p>
                    </div>

                    <div className="">
                        <h1 className="text-4xl font-bold">Our History</h1>
                        <p className="text-white/75">Placeholder</p>
                    </div>
                </div>

                <div className="mt-4">
                    <h1 className="text-4xl font-bold mt-2">Our Team</h1>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        {Team.map((member) => (
                            <div
                                key={member.id}
                                className="relative bg-gradient-to-br to-neutral-900 from-neutral-800 rounded-lg p-6 text-white overflow-hidden ring-2 ring-white/25 text-center"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full inline-block ring-2 ring-white/25"
                                />
                                <h1 className="mt-2 text-lg font-semibold">{member.name}</h1>
                                <p className="mt-4 text-sm ring-1 ring-second-accent bg-second-accent/25 py-0.5 px-2 rounded-xl mx-4">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
