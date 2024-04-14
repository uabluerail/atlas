import { FC, Dispatch, SetStateAction } from 'react'
import { getTranslation } from "../common/translation";
import { config } from '../common/visualConfig';
import { MultiDirectedGraph } from "graphology";
import { formatDistanceToNow, parseISO } from "date-fns";
import LanguagePicker from "./LanguagePicker"
import { SetURLSearchParams } from 'react-router-dom';

interface FooterProps {
    currentLanguage: string;
    graph: MultiDirectedGraph | null;
    searchParams: URLSearchParams;
    setSearchParams: SetURLSearchParams;
    setCurrentLanguage: Dispatch<SetStateAction<string>>;
}

const Footer: FC<FooterProps> = ({
    currentLanguage,
    graph,
    searchParams,
    setSearchParams,
    setCurrentLanguage }) => {
    return (
        <footer className="bg-white fixed bottom-0 text-center w-full z-40">
            <div className='mb-0.5'>
                {config.legend.author &&
                    <span className="footer-text text-xs">
                        <span className='xs:hidden'>{"🌐 "}{getTranslation('language', currentLanguage)}{": "}</span>
                        <LanguagePicker
                            searchParams={searchParams}
                            setSearchParams={setSearchParams}
                            currentLanguage={currentLanguage}
                            setCurrentLanguage={setCurrentLanguage} />
                    </span>
                }
                <span className={`footer-text text-xs`}>
                    <span className='ml-0.5'>{" "}{getTranslation('cluster_algo_made_by', currentLanguage)}{" "}</span>
                    <a
                        href={config.legend.author.url}
                        target="_blank"
                        className="font-bold underline-offset-1 underline"
                    >
                        {config.legend.author.name}
                    </a>
                    {". "}
                    <a
                        href="https://github.com/uabluerail/atlas"
                        target="_blank"
                    >
                        <img
                            src="/github.svg"
                            className="inline-block h-3.5 w-4 mb-0.5"
                        />
                    </a>
                </span>
                <span className={`footer-text block text-xs`}>
                    {getTranslation('visualization', currentLanguage)}{" "}
                    <a
                        href="https://bsky.jazco.dev/atlas"
                        target="_blank"
                        className="font-bold underline-offset-1 underline"
                    >
                        {getTranslation('based_on_atlas', currentLanguage)}
                    </a>{" "}{getTranslation('from', currentLanguage)}{" "}
                    <a
                        href="https://bsky.app/profile/jaz.bsky.social"
                        target="_blank"
                        className="font-bold underline-offset-1 underline"
                    >
                        Jaz
                    </a>
                    {" 🏳️‍⚧️"}

                    <span className="footer-text text-xs">
                        {" | "}
                        {graph
                            ? formatDistanceToNow(
                                parseISO(graph?.getAttribute("lastUpdated")),
                                { addSuffix: true }
                            )
                            : getTranslation('loading', currentLanguage)}{" "}
                        <img src="/update-icon.svg" className="inline-block h-4 w-4" />
                    </span>
                </span>
            </div>
        </footer >
    )
}

export default Footer;