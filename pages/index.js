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
      (bug) => ["murtaza.hanif@gmail.com", "umer.m@fourdotstechnologies.com"].includes(bug.assigned_to)
    ).filter(bug => {
      return Math.abs(dayjs(bug.creation_time).diff(dayjs(), 'h')) < 48
    });
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
  if (tData.length === 0) {
    return <div className="text-center text-2xl text-gray-700">No new bugs since last 48 hours</div>
  }
  return <div>
      {tData.map((bug) => <Bug key={bug.id} bug={bug} />)}
  </div>
}

const BugZillaUpdate = () => {
  const { data, error } = useSWR(API, fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  
  const transformData = (data) => {
    const murtazaBugs = data.bugs.filter(
      (bug) => bug.assigned_to === "murtaza.hanif@gmail.com" && bug.status !== 'RESOLVED'
    );
    const murtazaBugsWithDeadline = murtazaBugs;
  
    murtazaBugsWithDeadline.sort((a, b) => {
      if (dayjs(b.cf_nextstepdue).isSameOrAfter(a.cf_nextstepdue)) {
        return -1;
      }
      return 1;
    });
  
    // last_change_time
    return murtazaBugsWithDeadline;
  };
  
  const tData = transformData(data);

  const dates = new Set(tData.map(b => b.cf_nextstepdue));

  const newDates = Array.from(dates).map(date => {
    return {
      date,
      bugs: tData.filter(bug => bug.cf_nextstepdue === date)
    }
  });
  

  return <div>
    <div>
      {newDates.map(date => <>
        <div className="mt-12 border-t border-blue-700"></div>
        <h2 className="text-xl mb-2 pt-2 font-bold">
      Due By {dayjs(date.date).format(format)} <span className="bg-green-800 text-white rounded-full
      px-2 items-center inline-flex">{date.bugs.length}</span>
        </h2>
        <Bugs bugs={date.bugs} />
        {}
      </>)}
    </div>
  </div>
}

const Bugs = ({ bugs }) => {
  const [c, setC] = useState(true);
  if (c) {
    return <button onClick={() => setC(false)}>⏬</button>
  }
  return <div>
    <button onClick={() => setC(true)}>⏫</button>
    <div>{bugs.map(bug => <Bug key={bug.id} bug={bug} />)}</div>
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
