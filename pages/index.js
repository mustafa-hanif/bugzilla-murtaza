import useSWR from "swr";
import { useState } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(relativeTime);

import { API } from "../constants/index";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const transformData = (data) => {
  const murtazaBugs = data.bugs.filter(
    (bug) => bug.assigned_to === "murtaza.hanif@gmail.com"
  );
  const murtazaBugsWithDeadline = data.bugs;
  // const murtazaBugsWithDeadline = data.bugs.
  // filter(bug => bug.deadline).
  // filter(bug => dayjs(bug.deadline).isSameOrBefore(dayjs()));

  // murtazaBugsWithDeadline.sort((a, b) => {
  //   //console.log(dayjs(a.deadline).format('DD/MM/YYYY'), dayjs(b.deadline).format('DD/MM/YYYY'), dayjs(a.deadline).isSameOrAfter(b.deadline))
  //   if (dayjs(a.deadline).isSameOrAfter(b.deadline)) {
  //     return -1;
  //   }
  //   return 1;
  // })
  murtazaBugsWithDeadline.sort((a, b) => {
    //console.log(dayjs(a.deadline).format('DD/MM/YYYY'), dayjs(b.deadline).format('DD/MM/YYYY'), dayjs(a.deadline).isSameOrAfter(b.deadline))
    if (dayjs(a.last_change_time).isSameOrAfter(b.last_change_time)) {
      return -1;
    }
    return 1;
  });

  // last_change_time
  return murtazaBugsWithDeadline;
};
export default function IndexPage() {
  const { data, error } = useSWR(API, fetcher);
  const [highestLimit, setHighestLimit] = useState(5);
  const [highLimit, setHighLimit] = useState(5);
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  const tData = transformData(data);

  // console.log(tData)
  return (
    <div className="p-8">
      <Head>
        <link rel="preload" href={API} as="fetch" crossorigin="anonymous" />
      </Head>
      <h1 className="text-5xl text-center text-accent-1 mb-2">
        Bugzilla Updates
      </h1>
      <div>
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
    </div>
  );
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
      <div className="text-lg text-red-800 underline">
        <a href={`http://10.130.20.19/bugzilla/show_bug.cgi?id=${id}`}>{id}</a>
      </div>
      <div className="text-xs text-gray-900">{component}</div>
      <div className="">{summary}</div>
      {deadline && <div className="">Deadline {dayjs(deadline).fromNow()}</div>}
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
                    {dayjs(cf_nextstepdue).fromNow()}
                  </span>
                </>
              ) : (
                <>
                  {" "}which is due{" "}
                  <span className="text-purple-800">
                    {dayjs(cf_nextstepdue).fromNow()}
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div className="text-xs font-semibold">
        Modified {dayjs(last_change_time).fromNow()}
      </div>
    </div>
  );
};
