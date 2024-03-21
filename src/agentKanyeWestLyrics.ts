import { Request, Response, route } from './httpSupport'
import { renderHtml } from './uiSupport'

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

async function langChainPipe(openaiApiKey: string, query: string): Promise<string> {
    const examples = [
        {
            "tweet": `But I'm a champion, so I turned tragedy to triumph/Make music that's fire, spit my soul through the wire`,
        },
        {
            "tweet": `I went to the malls and I balled too hard/Oh my god, is that a black card?/I turned around and replied, 'Why yes/ But I prefer the term African American Express`,
        },
        {
            "tweet": `I want to act ballerific like it's all terrific/I got a couple past-due bills, I won't get specific/I got a problem with spending before I get it/We all self-conscious, I'm just the first to admit it`,
        },
        {
            "tweet": `Well if this take away from my spins/Which'll probably take away from my ends/Then I hope this take away from my sins/And bring the day that I'm dreamin' about/Next time I'm in the club, everybody screamin' out`,
        },
        {
            "tweet": `Damn 'Ye it'd be stupid to diss you/Even your superficial raps is super official`,
        },
        {
            "tweet": `I think we at an all-time high/To get there, we run, we fly, we drive/'Cause with my family we know where home is/And so instead of sending flowers, we're the roses`,
        },
        {
            "tweet": `I'm trying to right my wrongs/But it's funny them same wrongs helped me write this song`,
        },
        {
            "tweet": `Though it's thousands of miles away/Sierra Leone connects to what we go through today/Over here it's a drug trade, we die from drugs/Over there they die from what we buy from drugs`,
        },
        {
            "tweet": `When it feel like living's harder than dying/For me giving up's way harder than trying`,
        },
        {
            "tweet": `She don't believe in shooting stars/But she believe in shoes and cars`,
        },
        {
            "tweet": `I had a dream I could buy my way to heaven/When I awoke, I spent that on a necklace/I told God I'd be back in a second/Man, it's so hard not to act reckless`,
        },
        {
            "tweet": `I always had a passion for flashin'/Befo' I had it, I closed my eyes and imagined, the good life`,
        },
        {
            "tweet": `Reach for the stars so if you fall, you land on a cloud/Jump in the crowd, spark your lighters, wave 'em around/If you don't know by now, I'm talking 'bout Chi-Town`,
        },
        {
            "tweet": `My big brother was B.I.G.'s brother/So here's a few words from ya kid brother/If you admire somebody you should go on 'head tell 'em/People never get the flowers while they can still smell 'em`,
        },
        {
            "tweet": `So I hopped in the cab and I paid my fare/See I know my destination, but I'm just not there`,
        },
        {
            "tweet": `In the night I hear them talk/The coldest story ever told/Somewhere far along this road/He lost his soul/To a woman so heartless`,
        },
        {
            "tweet": `Screams from the haters, got a nice ring to it/I guess every superhero need his theme music`,
        },
        {
            "tweet": `Let's have a toast for the douchebags/Let's have a toast for the assholes/Let's have a toast for the scumbags/Every one of them that I know/Let's have a toast for the jerk-offs/That'll never take work off/Baby, I got a plan/Run away fast as you can`,
        },
        {
            "tweet": `Men be writing bullshit like they gotta work/We is going through real shit, man, they out of work/That's why another goddamn dance track gotta hurt/That's why I'd rather spit something that got a purp`,
        },
        {
            "tweet": `I’m heading home, I’m almost there/I’m on my way, heading up the stairs/To my surprise, a man replacing me/I had to take him to that ghetto university`,
        },
        {
            "tweet": `My momma was raised in the era when/Clean water was only served to the fairer skin/Doin' clothes you would have thought I had help/But they wasn't satisfied unless I picked the cotton myself`,
        },
        {
            "tweet": `I'll turn the plane 'round, your ass keep complainin'/How you gon' be mad on vacation?`,
        },
        {
            "tweet": `She Instagram herself like #BadBitchAlert/He Instagram his watch like #MadRichAlert`,
        },
        {
            "tweet": `I been thinking/About my vision/Pour out my feelings/Revealing the layers to my soul`,
        },
        {
            "tweet": `The sun is in my eyes, whoo!/Woke up and felt the vibe, whoo!/No matter how hard they try, whoo!/We never gonna die`,
        },
    ];
    const examplePrompt = new PromptTemplate({
        inputVariables: ["tweet"],
        template: `Tweet: {tweet}`
    });

    const prefixTemplate = "You are {identity} and you are genius lyricist with insightful ideas on songwriting. Here are some examples:";
    const suffixTemplate = `User: {query}
    Answer:`;

    const prefixPrompt = new PromptTemplate({
        inputVariables: ["identity"],
        template: prefixTemplate
    });

    const fewShotPromptTemplate = new FewShotPromptTemplate({
        examples: examples,
        examplePrompt: examplePrompt,
        prefix: await prefixPrompt.format({ identity: "Yeezus" }),
        suffix: suffixTemplate,
        inputVariables: ["query"]
    });

    console.log(await fewShotPromptTemplate.format({ query: query }));

    const model = new ChatOpenAI({ openAIApiKey: openaiApiKey });
    const outputParser = new StringOutputParser();

    const chain = fewShotPromptTemplate.pipe(model).pipe(outputParser);

    return chain.invoke({
        query: query
    });
}

async function GET(req: Request): Promise<Response> {
    const openaiApiKey = req.secret?.openaiApiKey as string;
    const query = req.queries.chatQuery[0] as string;

    const content = await langChainPipe(openaiApiKey, query);
    return new Response(renderHtml(content));
}

async function POST(req: Request): Promise<Response> {
    const openaiApiKey = req.secret?.openaiApiKey as string;
    const query = req.queries.chatQuery[0] as string;

    const content = await langChainPipe(openaiApiKey, query);
    return new Response(renderHtml(content));
}

export default async function main(request: string) {
    return await route({ GET, POST }, request);
}
