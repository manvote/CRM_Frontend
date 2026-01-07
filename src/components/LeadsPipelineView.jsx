import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PipelineCard from "./PipelineCard";

const LeadsPipelineView = ({ leads, onDelete, onDragEnd }) => {
  // Columns definition matching User Request: Opened, New Lead, Interested, Closed
  const columns = [
    {
      id: "Opened",
      label: "Opened",
      color: "bg-yellow-400",
      filter: (status) => ["Opened"].includes(status),
      bgColor: "bg-yellow-50",
    },
    {
      id: "New Lead",
      label: "New Lead",
      color: "bg-green-500",
      filter: (status) => ["New", "New Lead"].includes(status),
      bgColor: "bg-green-50",
    },
    {
      id: "Interested",
      label: "Interested",
      color: "bg-purple-500",
      filter: (status) => ["Interested", "Interested Lead"].includes(status),
      bgColor: "bg-purple-50",
    },
    {
      id: "Closed",
      label: "Closed",
      color: "bg-red-500",
      filter: (status) => ["Rejected", "Closed"].includes(status),
      bgColor: "bg-red-50",
    },
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto pb-4 gap-6 px-2">
        {columns.map((column) => {
          const columnLeads = leads.filter((lead) =>
            column.filter(lead.status)
          );

          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-w-[300px] flex flex-col h-full rounded-xl ${
                    snapshot.isDraggingOver
                      ? "bg-gray-100 ring-2 ring-gray-200"
                      : "bg-transparent"
                  } transition-colors p-2`}
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div
                      className={`w-3 h-3 rounded-full ${column.color}`}
                    ></div>
                    <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                      {column.label}
                    </span>
                    <span className="ml-auto text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[150px]">
                    {columnLeads.map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={String(lead.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`${
                              snapshot.isDragging
                                ? "rotate-2 z-50 opacity-90 scale-105"
                                : ""
                            }`}
                          >
                            <PipelineCard lead={lead} onDelete={onDelete} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default LeadsPipelineView;
