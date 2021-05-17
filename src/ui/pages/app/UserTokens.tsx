import './UserTokens.css';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ accountVM, app }: { accountVM?: AccountVM; app: Application }) => {
  const { allTokens } = accountVM;

  return (
    <div className="page tokens">
      <NavBar title="Tokens" onBackClick={() => app.history.goBack()} />

      <div className="content">
        <DragDropContext
          onDragEnd={(_) => {
            console.log(_);
          }}
        >
          <Droppable droppableId={'tokens'}>
            {(provided, snapshot) => (
              <div className="tokens" {...provided.droppableProps} ref={provided.innerRef}>
                {allTokens.map((t, i) => {
                  return (
                    <Draggable key={t.id} draggableId={t.id} index={i}>
                      {(provided, snapshot) => (
                        <div
                          className="token"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {t.name}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
});
