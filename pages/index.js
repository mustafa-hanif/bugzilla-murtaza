import useSWR from "swr";
import { useState } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import advancedFormat from 'dayjs/plugin/advancedFormat'
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

import { API } from "../constants/index";

const format = 'Do MMM YYYY';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function IndexPage() {
  const [page, setPage] = useState('bugzilla');

  // console.log(tData)
  
  return (
    <div className="p-8">
      <Head>
        <link rel="preload" href={API} as="fetch" crossorigin="anonymous" />
      </Head>
      <h1 className='text-5xl text-center mb-2'>
        <button className={page !== 'bugzilla' ? 'text-gray-300' : ''} onClick={()=>setPage('bugzilla')}>Bugzilla Updates</button>
      </h1>
      <h1 className={`text-5xl text-center mb-2`}>
        <button className={page === 'bugzilla' ? 'text-gray-300' : ''} onClick={()=>setPage('newbugs')}>New Bugs</button>
      </h1>
      {page === 'newbugs' && <NewBugs />}
      {page === 'bugzilla' && <BugZillaUpdate />}
    </div>
  );
}

const NewBugs = () => {
  const { data, error } = useSWR(API, fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  const transformData = (data) => {
    const murtazaBugs = data.bugs.filter(
      (bug) => bug.assigned_to === "murtaza.hanif@gmail.com"
    );
    const murtazaBugsWithDeadline = murtazaBugs;
  
    murtazaBugsWithDeadline.sort((a, b) => {
      if (dayjs(a.creation_time).isSameOrAfter(b.creation_time)) {
        return -1;
      }
      return 1;
    });
  
    // last_change_time
    return murtazaBugsWithDeadline;
  };

  const tData = transformData(data);

  return <div>
      {tData.map((bug) => <Bug key={bug.id} bug={bug} />)}
  </div>
}

const BugZillaUpdate = () => {
  const { data, error } = useSWR(API, fetcher);

  const [highestLimit, setHighestLimit] = useState(5);
  const [highLimit, setHighLimit] = useState(5);
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  
  const transformData = (data) => {
    const murtazaBugs = data.bugs.filter(
      (bug) => bug.assigned_to === "murtaza.hanif@gmail.com"
    );
    const murtazaBugsWithDeadline = murtazaBugs;
  
    murtazaBugsWithDeadline.sort((a, b) => {
      if (dayjs(a.last_change_time).isSameOrAfter(b.last_change_time)) {
        return -1;
      }
      return 1;
    });
  
    // last_change_time
    return murtazaBugsWithDeadline;
  };
  
  const tData = transformData(data);

  return <div>
    <div>
      <h2 className="text-xl mb-2">
        Highest Priority Bugs - Sorted by modified date
      </h2>
      {tData
        .filter((bug) => bug.priority === "Highest")
        .slice(0, highestLimit)
        .map((bug) => {
          return <Bug key={bug.id} bug={bug} />;
        })}
      <button
        className="bg-blue-600 text-white px-4 py-1 rounded-lg mb-8"
        onClick={() => setHighestLimit(highestLimit + 5)}
      >
        Show More Highest Priority Bugs
      </button>
    </div>
    <div>
      <h2 className="text-xl mb-2">
        High Priority Bugs - Sorted by modified date
      </h2>
      {tData
        .filter((bug) => bug.priority === "High")
        .slice(0, highLimit)
        .map((bug) => {
          return <Bug key={bug.id} bug={bug} />;
        })}
      <button
        className="bg-blue-600 text-white px-4 py-1 rounded-lg mb-8"
        onClick={() => setHighLimit(highLimit + 5)}
      >
        Show More High Priority Bugs
      </button>
    </div>
  </div>
}

const Bug = ({ bug }) => {
  const {
    id,
    summary,
    component,
    deadline,
    last_change_time,
    priority,
    cf_nextstep,
    cf_nextstepdue,
    creation_time
  } = bug;

  let bgColor = "bg-gray-100";
  if (priority === "Highest") {
    bgColor = "bg-red-100";
  }
  if (priority === "High") {
    bgColor = "bg-yellow-100";
  }
  return (
    <div className={`${bgColor} shadow-md mb-4 p-2 rounded-lg`}>
      <div className="text-lg">
        <a className="text-red-800 underline mr-2" href={`http://10.130.20.19/bugzilla/show_bug.cgi?id=${id}`}>{id}</a>
        <span className="bg-gray-800 text-white text-xs px-1 py-1 rounded-md uppercase">{priority}</span>
      </div>
      <p>Created at: {dayjs(creation_time).format(format)}</p>
      <div className="text-xs text-gray-900">{component}</div>
      <div className="">{summary}</div>
      {deadline && <div className="">Deadline {dayjs(deadline).fromNow()} ({dayjs(deadline).format(format)})</div>}
      {cf_nextstep && (
        <div className="font-semibold">
          Next Step is {cf_nextstep}
          {cf_nextstepdue && (
            <span>
              ,
              {dayjs().isSameOrAfter(dayjs(cf_nextstepdue)) ? (
                <>
                  {" "}which was due{" "}
                  <span className="text-red-800">
                    {dayjs(cf_nextstepdue).fromNow()} ({dayjs(cf_nextstepdue).format(format)})
                  </span>
                </>
              ) : (
                <>
                  {" "}which is due{" "}
                  <span className="text-purple-800">
                    {dayjs(cf_nextstepdue).fromNow()}  ({dayjs(cf_nextstepdue).format(format)})
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div className="text-xs font-semibold">
        Modified {dayjs(last_change_time).fromNow()} ({dayjs(last_change_time).format(format)})
      </div>
    </div>
  );
};
