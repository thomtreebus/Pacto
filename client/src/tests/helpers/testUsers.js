/**
 * A file to store the test users used by some tests.
 */

/**
 * The test users list which can be used by other helper
 * files. Note the default user for the useMockServerHook and 
 * many other tests is user[0].
 */
const users = [
	{
        _id: 1,
        active: true,
        bio: "Zawuug hovseb okemewuf paifjow wozibcul pe eto jajseda oki bal kub fej iweto. Du rom hibipi fousnu guka rug omzof kef nomeupe wegpukig jil jemdabtam cidbec. Ci givu tecuj nawarewa umaju on nafe ke osudu vaovo piltakho sojnaze dibun ma zuadiav. Abu adtenazu ho wos af pezo vizwuh zogo luhhirub ju one duri olane del awusebjuw ahifoza edoedjaj. Te hela va ro kedfuza hatipde inalocod ugo maglihhuj locu jutu ar nuzpov fazakkir jotus. Tetjewi rijodwul unasi ba mat mo surpa okajis kifim pavov tetof aksi gokona.",
        course: "Physics",
        firstName: "Pac",
        friends: [3],
        hobbies: ['Studying', 'Sleeping'],
        image: "http://res.cloudinary.com/djlwzi9br/image/upload/v1647542156/n6ds0kmqlhsgtt4ukrym.png",
        instagram: "Pac.To",
        lastName: "To",
        linkedin: "Pac.To",
        location: "Liverpool",
        pacts: [1],
        password: "$2b$10$RPzzCadIwiq5C1Jmf5ltKujRgKRCi2D0X7eJkqQPS7sWxArWM0Hwu",
        phone: "07624 780037",
        uniEmail: "pac.to@kcl.ac.uk",
        university: "623372b09841b9fb6b85f3de",
        sentRequests: [{_id: 1, recipient: 2, requestor: 1}],
        receivedRequests: [{_id: 2, recipient: 1, requestor: 3}]
	},
        {
        _id: 2,
        active: true,
        bio: "Hello",
        course: "Computer Science",
        firstName: "Thom",
        friends: ["1"],
        hobbies: ['Studying', 'Economics'],
        image: "https://avatars.dicebear.com/api/identicon/temp.svg",
        instagram: "Thom.Tree",
        lastName: "Tree",
        linkedin: "Thom.Tree",
        location: "Belgium",
        pacts: [1, '623372b49841b9fb6b85f4d9'],
        password: "$2b$10$RPzzCadIwiq5C1Jmf5ltKujRgKRCi2D0X7eJkqQPS7sWxArWM0Hwu",
        phone: "07624 780037",
        uniEmail: "thom.tree@kcl.ac.uk",
        university: "623372b09841b9fb6b85f3de",
        receivedRequests: [{_id: 1, recipient: 2, requestor: 1}],
	},
	{
        _id: 3,
        active: true,
        bio: "Hi",
        course: "Biology",
        firstName: "Kaushik",
        friends: [],
        hobbies: ['Computer Science', 'Economics'],
        image: "https://avatars.dicebear.com/api/identicon/temp.svg",
        instagram: "Kau.Chin",
        lastName: "Chin",
        linkedin: "Kau.Chin",
        location: "London",
        pacts: ['623372b49841b9fb6b85f4d9'],
        password: "$2b$10$RPzzCadIwiq5C1Jmf5ltKujRgKRCi2D0X7eJkqQPS7sWxArWM0Hwu",
        phone: "07624 780037",
        uniEmail: "kau.Chin@kcl.ac.uk",
        university: "623372b09841b9fb6b85f3de",
        sentRequests: [{_id: 2, recipient: 1, requestor: 3}]
	},
	{
        _id: 4,
        active: true,
        bio: "Welcom",
        course: "Geography",
        firstName: "Chirag",
        friends: [],
        hobbies: [],
        image: "https://avatars.dicebear.com/api/identicon/temp.svg",
        instagram: "Chirag.Mah",
        lastName: "Mah",
        linkedin: "Chirag.Mah",
        location: "London",
        pacts: ['623372b49841b9fb6b85f4d9'],
        password: "$2b$10$RPzzCadIwiq5C1Jmf5ltKujRgKRCi2D0X7eJkqQPS7sWxArWM0Hwu",
        phone: "07624 780037",
        uniEmail: "chirag.mah@kcl.ac.uk",
        university: "623372b09841b9fb6b85f3de",
	},
];

export default users;