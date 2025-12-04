import React from 'react';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * Hook: useOptimisticDelete
 *
 * Usage:
 * const { optimisticDelete } = useOptimisticDelete();
 * optimisticDelete({
 *   items: itemOrArrayOrIds,
 *   removeAction, // redux action to remove from UI (accepts id or array of ids)
 *   restoreAction, // redux action to restore items (accepts original items)
 *   serverThunk, // redux thunk to call server delete. If `serverMode` is 'single' we'll call it per id; if 'array' we'll call once with array.
 *   toastMessage, // optional message
 *   wait // ms to wait before committing to server (default 5000)
 *   serverMode: 'single' | 'array'
 * })
 */
export default function useOptimisticDelete() {
  const dispatch = useDispatch();
  const timersRef = useRef(new Map());

  const optimisticDelete = ({
    items,
    removeAction,
    restoreAction,
    serverThunk,
    toastMessage = 'Deleted',
    wait = 5000,
    serverMode = 'single'
  }) => {
    if (!items) return;

    // Normalize ids and snapshot
    const isArray = Array.isArray(items);
    const snapshot = items;
    const ids = isArray
      ? items.map((it) => (typeof it === 'object' ? it._id || it.id : it))
      : [(typeof items === 'object' ? items._id || items.id : items)];

    // Remove from UI immediately
    try {
      dispatch(removeAction(isArray ? ids : ids[0]));
    } catch (err) {
      console.error('removeAction dispatch failed', err);
    }

    // Unique timer id
    const timerId = `optimistic-delete-${Date.now()}-${Math.random()}`;

    const toastId = toast((t) => (
      <div className="flex items-center space-x-3">
        <div className="flex-1">{toastMessage}</div>
        <div>
          <button
            onClick={() => {
              // cancel timer
              const timer = timersRef.current.get(timerId);
              if (timer) {
                clearTimeout(timer);
                timersRef.current.delete(timerId);
              }
              // restore UI
              try {
                dispatch(restoreAction(snapshot));
              } catch (err) {
                console.error('restoreAction dispatch failed', err);
              }
              toast.dismiss(t.id);
            }}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
          >
            Undo
          </button>
        </div>
      </div>
    ), { duration: wait + 1000 });

    // Schedule server call
    const timer = setTimeout(async () => {
      try {
        if (serverMode === 'array') {
          // call thunk once with array
          const result = await dispatch(serverThunk(ids)).unwrap?.();
          void result;
        } else {
          // call thunk per id
          await Promise.all(
            ids.map(async (id) => {
              try {
                await dispatch(serverThunk(id)).unwrap?.();
              } catch (err) {
                // throw to outer catch so we can restore
                throw err;
              }
            })
          );
        }
        toast.dismiss(toastId);
      } catch (err) {
        // restore on error
        try {
          dispatch(restoreAction(snapshot));
        } catch (e) {
          console.error('restoreAction after failed server delete failed', e);
        }
        toast.error('Delete failed. Restored.');
      } finally {
        timersRef.current.delete(timerId);
      }
    }, wait);

    timersRef.current.set(timerId, timer);
  };

  return { optimisticDelete };
}
