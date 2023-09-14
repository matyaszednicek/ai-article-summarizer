import { LinkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import {
  CheckIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon as PaperAirplaneIconOutline,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useLazyGetSummaryQuery } from '../services/article';
import { RadioGroup } from '@headlessui/react';

function Demo() {
  const [submitHover, setSubmitHover] = useState(false);
  const [paragraphs, setParagraphs] = useState(1);
  const [article, setArticle] = useState<Article>({
    url: '',
    summary: '',
  });
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [copy, setCopy] = useState<string>('');

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem('articles') || 'null');
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data } = await getSummary({ url: article.url, length: paragraphs });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);

      localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopyClick = (copyUrl: string) => {
    setCopy(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopy(''), 3000);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, deleteUrl: string) => {
    e.stopPropagation();
    const newArticles = allArticles.filter((article) => article.url !== deleteUrl);

    setAllArticles(newArticles);
    localStorage.setItem('articles', JSON.stringify(newArticles));
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
          <div className="flex relative justfiy-center items-center w-full">
            <LinkIcon className="absolute left-0 my-2 ml-3 w-5 text-gray-950" />
            <input
              type="url"
              placeholder="Enter a URL"
              value={article.url}
              onChange={(e) => {
                setArticle({ ...article, url: e.target.value });
              }}
              required
              className="peer block w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-12 text-sm shadow-lg font-medium focus:border-gray-950 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              onMouseOver={() => {
                setSubmitHover(true);
              }}
              onMouseLeave={() => {
                setSubmitHover(false);
              }}
              className="group w-10 absolute inset-y-0 right-0 px-2"
            >
              {submitHover ? (
                <PaperAirplaneIcon className="w-6 text-gray-200 peer-focus:group-[]:text-gray-950" />
              ) : (
                <PaperAirplaneIconOutline className="w-6 text-gray-200 peer-focus:group-[]:text-gray-950" />
              )}
            </button>
          </div>
          <RadioGroup
            className="flex w-full space-x-1 h-[42px] justify-between rounded-md shadow-lg items-center border border-gray-200 bg-gray-50 mt-2 py-1 px-2"
            value={paragraphs}
            onChange={setParagraphs}
          >
            <RadioGroup.Label className="min-w-[11rem] text-sm text-gray-500 font-medium">
              Number of Paragraphs
            </RadioGroup.Label>
            <RadioGroup.Option className="w-full h-full" value={1}>
              {({ checked }) => (
                <div
                  className={`rounded-md w-full h-full border border-gray-200 bg-gray-50 flex justify-center items-center cursor-pointer ${
                    checked ? 'border-gray-950' : ''
                  }`}
                >
                  1
                </div>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option className="w-full h-full" value={2}>
              {({ checked }) => (
                <div
                  className={`rounded-md w-full h-full border border-gray-200 bg-gray-50 flex justify-center items-center cursor-pointer ${
                    checked ? 'border-gray-950' : ''
                  }`}
                >
                  2
                </div>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option className="w-full h-full" value={3}>
              {({ checked }) => (
                <div
                  className={`rounded-md w-full h-full border border-gray-200 bg-gray-50 flex justify-center items-center cursor-pointer ${
                    checked ? 'border-gray-950' : ''
                  }`}
                >
                  3
                </div>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </form>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles &&
            allArticles.map((article, index) => (
              <div
                key={`link-${index}`}
                onClick={() => setArticle(article)}
                className="p-3 flex justify-start items-center flex-row bg-white border border-gray-200 gap-3 rounded-lg cursor-pointer"
              >
                <div
                  onClick={() => handleCopyClick(article.url)}
                  className="w-7 h-7 rounded-full bg-white/10 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur flex justify-center items-center cursor-pointer"
                >
                  {copy === article.url ? (
                    <CheckIcon className="w-[40%] h-[40%] object-contain" />
                  ) : (
                    <DocumentDuplicateIcon className="w-[40%] h-[40%] object-contain" />
                  )}
                </div>
                <p className="flex-1 text-blue-500 font-medium text-sm truncate">{article.url}</p>
                <div
                  onClick={(e) => handleDeleteClick(e, article.url)}
                  className="w-7 h-7 rounded-full bg-white/10 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur flex justify-center items-center cursor-pointer"
                >
                  <TrashIcon className="w-[40%] h-[40%] object-contain" />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <Spinner />
        ) : error ? (
          <p className="font-bold text-gray-900 text-center">
            Sorry, there was an error while summarizing your article, please try again.
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-gray-600 text-xl">
                Article{' '}
                <span className="font-black bg-gradient-to-r to-[#ee9701] via-[#f8bb08] via-60% from-[#ee7001] bg-clip-text text-transparent">
                  Summary
                </span>
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white/20 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur p-4">
                <p className="font-medium text-gray-700 text-sm">{article.summary}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

const Spinner = () => (
  <div className="flex w-full justify-center">
    <svg
      className="animate-spin my-6 h-12 w-12 text-[#ee7001]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

export default Demo;
