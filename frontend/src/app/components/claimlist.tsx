'use client';

import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type DefinitionBoxProps = {
  text: string;
  claimID: string;
};

export type ClaimBoxProps = {
  initialText: string;
  claimID: string;
  user: string;
  definitions: DefinitionBoxProps[];
};

export type ClaimListProps = {
  initialClaims: ClaimBoxProps[];
};

const DefinitionBox = ({definition, index, final, claimID}:
  {definition: DefinitionBoxProps, index: number, final: boolean, claimID: string}) => {
  return (
    /**
     * Note: I'm assuming that claimID and definition.claimID are both alphanumeric.
     * Otherwise "..."+"."+".." and ".."+"."+"..." would produce the same key. */
    <Draggable draggableId={claimID+"."+definition.claimID} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <div className="flex shadow-xl">
            <div className={`${final ? "rounded-bl-md" : "rounded-none"} bg-teal-900 text-white w-20 p-2`}>
              <p className="text-sm truncate">{definition.claimID}</p>
            </div>
            <div className={`${final ? "rounded-br-md" : "rounded-none"} bg-teal-950 text-white flex-1 p-2 min-w-0`}>
              <p className="text-sm break-words">{definition.text}</p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function DefinitionList({initialDefinitions, claimID}:
  {initialDefinitions: DefinitionBoxProps[], claimID: string}) {
  //I only use the claimID to generate unique keys and ID's.
  const [definitions, setDefinitions] = useState(initialDefinitions);

  function onDragEnd(result : DropResult) {
    if (!result.destination || (result.destination.index === result.source.index)) {
      return;
    }

    const newDefinitions = Array.from(definitions);
    const [removed] = newDefinitions.splice(result.source.index, 1);
    newDefinitions.splice(result.destination.index, 0, removed);

    setDefinitions(newDefinitions);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={claimID+"-list"}>
        {provided => (
          <div className="flex flex-col"
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {definitions.map((definition: DefinitionBoxProps, index: number) => (
              <DefinitionBox
                definition={definition}
                index={index}
                final={index===definitions.length - 1}
                claimID={claimID}
                key={claimID+"."+definition.claimID}
                /**
                 * Note: I'm assuming that claimID and definition.claimID are both alphanumeric.
                 * Otherwise "..."+"."+".." and ".."+"."+"..." would produce the same key. */
              />))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function ClaimContentRegion({ initialText }: { initialText: string }) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustHeight();
  };

  return (
    <>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="bg-slate-900 text-white flex-1 p-2 rounded-r-md break-words min-w-0 text-sm outline-none"
          value={text}
          onChange={handleChange}
          onBlur={() => setIsEditing(false)}
          autoFocus
          style={{ overflow: 'hidden' }}
        />
      ) : (
        <p className="bg-slate-900 text-white flex-1 p-2 rounded-r-md break-words min-w-0 text-sm"
          onClick={() => setIsEditing(true)}>
          {text}
        </p>
      )}
    </>
  );
}


const ClaimBox = ({claim, index} : {claim: ClaimBoxProps, index: number}) => {
  return (
    <Draggable draggableId={claim.claimID} index={index}>
      {provided => (
        <div className="flex flex-col"
          ref={provided.innerRef} {...provided.draggableProps}>
          <div className="flex shadow-xl" {...provided.dragHandleProps}>
            <div className="bg-slate-800 text-white w-20 p-2 rounded-l-md">
              <p className="text-sm truncate">{claim.claimID}</p>
              <p className="text-sm truncate">{claim.user}</p>
            </div>
            <ClaimContentRegion initialText={claim.initialText} />
          </div>
          <div className="ml-20">
            <DefinitionList initialDefinitions={claim.definitions} claimID={claim.claimID} />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ClaimList({initialClaims} : ClaimListProps) {
  const [claims, setClaims] = useState(initialClaims);

  function onDragEnd(result : DropResult) {
    if (!result.destination || (result.destination.index === result.source.index)) {
      return;
    }

    const newClaims = Array.from(claims);
    const [removed] = newClaims.splice(result.source.index, 1);
    newClaims.splice(result.destination.index, 0, removed);

    setClaims(newClaims);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {provided => (
          <div className="flex flex-col p-4 gap-4"
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {claims.map((claim: ClaimBoxProps, index: number) => (
              <ClaimBox claim={claim} index={index} key={claim.claimID} />))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
