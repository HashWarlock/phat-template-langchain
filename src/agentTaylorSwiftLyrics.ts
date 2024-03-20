import { Request, Response, route } from './httpSupport'
import { renderHtml } from './uiSupport'

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

async function langChainPipe(openaiApiKey: string, query: string): Promise<string> {
    const examples = [
        {
            "tweet": `You taught me ‘bout your past, thinking your future was me.`,
        },
        {
            "tweet": `We're happy, free, confused, and lonely in the best way / It's miserable and magical, oh, yeah / Tonight's the night when we forget about the heartbreaks`,
        },
        {
            "tweet": `I'm so sick of running as fast I can / Wondering if I'd get there quicker if I was a man`,
        },
        {
            "tweet": `Life was a willow and it bent right to your wind / But I come back stronger than a ’90s trend`,
        },
        {
            "tweet": `You got that James Dean daydream look in your eye / And I got that red lip classic thing that you like / And when we go crashing down, we come back every time / 'Cause we never go out of style`,
        },
        {
            "tweet": `We could let our friends crash in the living room / This is is our place, we make the call / And I'm highly suspicious that everyone who sees you wants you / I've loved you three summers now, honey, but I want 'em all`,
        },
        {
            "tweet": `Who could ever leave me, darling / But who could stay?`,
        },
        {
            "tweet": `You're not my homeland anymore / So what am I defending now?`,
        },
        {
            "tweet": `I walked out, I said, “I'm setting you free” / But the monsters turned out to be just trees`,
        },
        {
            "tweet": `You call me up again / Just to break me like a promise / So casually cruel in the name of being honest`,
        },
        {
            "tweet": `Cold was the steel of my axe to grind / For the boys who broke my heart / Now I send their babies presents`,
        },
        {
            "tweet": `Cause when you're fifteen and somebody tells you they love you / You're gonna believe them / And when you're fifteen, don't forget to look before you fall / I've found time can heal most anything / And you just might find who you're supposed to be`,
        },
        {
            "tweet": `They told me all of my cages were mental / So I got wasted like all my potential`,
        },
        {
            "tweet": `Time, mystical time / Cutting me open, then healing me fine`,
        },
        {
            "tweet": `You kept me like a secret, but I kept you like an oath`,
        },
        {
            "tweet": `Memorizing him was as / Easy as knowing all the words to your old favorite song / Fighting with him was like / Trying to solve a crossword and realizing there's no right answer / Regretting him was like / Wishing you never found out that love could be that strong`,
        },
        {
            "tweet": `I once believed love would be (burning red) / But it's golden / Like daylight`,
        },
        {
            "tweet": `All my flowers grew back as thorns / Windows boarded up after the storm / He built a fire just to keep me warm`,
        },
        {
            "tweet": `I never grew up, it's getting so old / Help me hold on to you`,
        },
        {
            "tweet": `Don't you worry your pretty, little mind / People throw rocks at things that shine / And life makes love look hard / The stakes are high, the water's rough / But this love is ours`,
        },
    ];
    const examplePrompt = new PromptTemplate({
        inputVariables: ["tweet"],
        template: `Tweet: {tweet}`
    });

    const prefixTemplate = "You are {identity} and you are proposing some insightful ideas. Here are some examples:";
    const suffixTemplate = `User: {query}
    Answer:`;

    const prefixPrompt = new PromptTemplate({
        inputVariables: ["identity"],
        template: prefixTemplate
    });

    const fewShotPromptTemplate = new FewShotPromptTemplate({
        examples: examples,
        examplePrompt: examplePrompt,
        prefix: await prefixPrompt.format({ identity: "Taylor Swift" }),
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
