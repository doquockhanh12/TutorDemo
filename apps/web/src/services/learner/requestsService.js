export function countLearnerRequests(requests) { return {
    all: requests.filter((r) => r.status !== 'cancelled').length,
    pending: requests.filter((r) => r.status === 'pending' && !r.completed).length,
    accepted: requests.filter((r) => r.status === 'accepted' && !r.completed).length,
    completed: requests.filter((r) => r.completed).length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  }; }

export function filterLearnerRequests(requests, filter) {
    const filtered = requests.filter((item) => {
      if (filter === 'all') return item.status !== 'cancelled';
      if (filter === 'completed') return item.completed;
      if (filter === 'cancelled') return item.status === 'cancelled';
      return item.status === filter && !item.completed;
    });
    const priority = (item) => item.status === 'pending' ? 0
      : item.completed ? 2 : item.status === 'accepted' ? 1
        : item.status === 'cancelled' ? 3 : 4;
    const createdTime = (item) => {
      if (typeof item.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(item.createdAt)) return null;
      const day = new Date(`${item.createdAt.slice(0, 10)}T00:00:00Z`);
      if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== item.createdAt.slice(0, 10)) return null;
      const timestamp = Date.parse(item.createdAt);
      return Number.isFinite(timestamp) ? timestamp : null;
    };
    return filtered.sort((a, b) => {
      const group = priority(a) - priority(b);
      if (group) return group;
      const aTime = createdTime(a);
      const bTime = createdTime(b);
      if (aTime !== null && bTime !== null) return bTime - aTime;
      if (aTime !== null) return -1;
      if (bTime !== null) return 1;
      return 0;
    });
}
export function selectRequestRows(visible, publicTutors) {
  return visible.map((request) => ({ request,
    tutor: publicTutors.find((t) => t.id === request.tutorId) || publicTutors[0],
    isAccepted: request.status === 'accepted', isPending: request.status === 'pending', isCompleted: Boolean(request.completed),
  }));
}
export function selectRequestDetail(requests, publicTutors, id) {
  const request = requests.find((item) => item.id === id);
  const tutor = publicTutors.find((item) => item.id === request?.tutorId);
  return { request, tutor };
}
export const patchLearnerRequestList = (requests, id, patch) => requests.map((item) => item.id === id ? { ...item, ...patch } : item);
