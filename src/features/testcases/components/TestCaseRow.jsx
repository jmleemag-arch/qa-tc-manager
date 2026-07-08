import Badge from "../../../components/common/Badge";

function TestCaseRow({
  testCase,
  isSelected,
  isDragging,
  onToggleSelect,
  onRowClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <tr
      className={`tc-row ${isDragging ? "tc-row-dragging" : ""} ${
        isSelected ? "tc-row-selected" : ""
      }`}
      onClick={() => onRowClick(testCase)}
      onDragOver={(e) => onDragOver(e, testCase.uid)}
      onDrop={(e) => onDrop(e, testCase.uid)}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("tc-row-drop-target");
      }}
    >
      <td className="tc-select-cell" onClick={stopPropagation}>
        <div className="tc-select-controls">
          <span
            className="tc-drag-handle"
            draggable
            onDragStart={(e) => onDragStart(e, testCase.uid)}
            onDragEnd={onDragEnd}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            aria-label={`${testCase.displayId} 순서 변경`}
            title="드래그하여 순서 변경"
          >
            ⋮⋮
          </span>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(testCase.uid)}
            onClick={stopPropagation}
            aria-label={`${testCase.displayId} 선택`}
          />
        </div>
      </td>
      <td className="tc-id">{testCase.displayId}</td>
      <td>{testCase.menu}</td>
      <td>{testCase.subMenu || "-"}</td>
      <td className="tc-cell-wrap tc-check-item">
        {testCase.checkItem || "-"}
      </td>
      <td className="tc-cell-wrap">{testCase.checkMethod || "-"}</td>
      <td className="tc-cell-wrap">{testCase.checkResult || "-"}</td>
      <td>
        <Badge type="isWorking" value={testCase.isWorking}>
          {testCase.isWorking}
        </Badge>
      </td>
      <td className="tc-cell-wrap tc-note">{testCase.note || "-"}</td>
    </tr>
  );
}

export default TestCaseRow;
